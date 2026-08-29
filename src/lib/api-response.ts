import { NextResponse } from "next/server";

export type ApiSuccess<T> = {
  ok: true;
  data: T;
  message?: string;
  errors: [];
};

export type ApiFailure = {
  ok: false;
  data: null;
  message: string;
  errors: string[];
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export function apiSuccess<T>(
  data: T,
  message?: string,
  status = 200
) {
  return NextResponse.json<ApiSuccess<T>>(
    {
      ok: true,
      data,
      message,
      errors: [],
    },
    { status }
  );
}

export function apiFailure(
  message: string,
  status = 400,
  errors: string[] = []
) {
  return NextResponse.json<ApiFailure>(
    {
      ok: false,
      data: null,
      message,
      errors,
    },
    { status }
  );
}
