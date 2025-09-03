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
