"use client";
import Link from "next/link";
import { MouseEventHandler } from "react";

export const UILink = (props: any) => {
  return (
    <Link
      href={props.to}
      passHref
      prefetch={props.prefetch || false}
      scroll={props.scroll || false}
      data-testid={props.testId}
      onClick={props.onClick as unknown as MouseEventHandler<HTMLAnchorElement>}
      aria-label={props.alt ?? ""}
      target={props.target}
    >
      <div>{props.children}</div>
    </Link>
  );
};
