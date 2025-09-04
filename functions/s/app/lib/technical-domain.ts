import type { FetcherWithComponents } from "react-router";
import React from "react";
import * as Rac from "react-aria-components";

export type FormActionResult =
  | {
      success: true;
      message?: string;
      details?: string | string[];
    }
  | {
      success: false;
      message?: string;
      details?: string | string[];
      validationErrors?: Rac.FormProps["validationErrors"];
    };

/**
 * Creates a form submit handler that prevents default submission and uses fetcher.submit.
 * @param fetcher - React Router fetcher for submitting the form.
 * @returns Event handler function for form onSubmit.
 */
export const onSubmit =
  (fetcher: FetcherWithComponents<unknown>) =>
  (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nativeEvent = e.nativeEvent;
    const submitter =
      nativeEvent instanceof SubmitEvent &&
      (nativeEvent.submitter instanceof HTMLButtonElement ||
        nativeEvent.submitter instanceof HTMLInputElement)
        ? nativeEvent.submitter
        : null;
    fetcher.submit(submitter || e.currentTarget, { method: "post" });
  };
