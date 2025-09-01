import { invariant } from "@epic-web/invariant";
import { AwsClient } from "aws4fetch";
import { env } from "cloudflare:workers";

/*

{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Sid": "Statement1",
			"Effect": "Allow",
			"Action": "ses:SendEmail",
			"Resource": "*",
			"Condition": {
				"StringEquals": {
					"ses:FromAddress": "motio@mail.com"
				}
			}
		}
	]
}

*/

export interface Ses {
  sendEmail: ({
    to,
    from,
    html,
    text,
    subject,
  }: {
    to: string;
    from: string;
    html: string;
    text: string;
    subject: string;
  }) => Promise<void>;
}

export function createSes(): Ses {
  const AWS_ENDPOINT =
    "https://email.us-east-1.amazonaws.com/v2/email/outbound-emails";
  const AWS_REGION = "us-east-1";
  invariant(env.AWS_ACCESS_KEY_ID, "Missing AWS_ACCESS_KEY_ID");
  invariant(env.AWS_SECRET_ACCESS_KEY, "Missing AWS_SECRET_ACCESS_KEY");
  invariant(env.EMAIL_WHITE_LIST, "Missing EMAIL_WHITE_LIST");
  const emailWhitelist = env.EMAIL_WHITE_LIST.split(",");

  const aws = new AwsClient({
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    region: AWS_REGION,
    retries: 1,
  });

  const sendEmail = async ({
    to,
    from,
    html,
    text,
    subject,
  }: {
    to: string;
    from: string;
    html: string;
    text: string;
    subject: string;
  }) => {
    console.log(`ses: sendEmail: to: ${to}`, { to, from, subject, text });
    if (emailWhitelist.length > 0 && !emailWhitelist.includes(to)) {
      console.log(
        `ses: sendEmail: skipping ${to} because it is not in the whitelist`,
      );
      return;
    }
    const response = await aws.fetch(AWS_ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        FromEmailAddress: from,
        Destination: {
          ToAddresses: [to],
        },
        Content: {
          Simple: {
            Subject: {
              Data: subject,
            },
            Body: {
              Text: {
                Data: text,
              },
              ...(html && {
                Html: {
                  Data: html,
                },
              }),
            },
          },
        },
      }),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `ses: error sending email: ${response.status} ${response.statusText} ${text}`,
      );
    }
  };

  return {
    sendEmail,
  };
}
