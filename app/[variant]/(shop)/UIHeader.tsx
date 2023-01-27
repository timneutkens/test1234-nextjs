"use client";
import { UILink } from "@/components/UILink";
import Link from "next/link";
import React from "react";
export const UIHeader = (p: any) => {
  const [counter, setCounter] = React.useState(0);
  return (
    <header className="border-b p-4">
      <nav className="flex gap-4" style={{ display: "flex", gap: 16 }}>
        {counter}
        <button onClick={() => setCounter((c) => c + 1)}>hit</button>
        <Link href="/">Home</Link>
        <Link href="shop">shop</Link>
        <Link href="product">product</Link>
        <Link href="/who-we-are">who we are</Link>
        <Link href="/about">about</Link>
        <Link href="/contact">contact</Link>
        {/* <UILink to="/">Home v2</UILink>
        <UILink to="shop">shop v2</UILink>
        <UILink to="product">product v2</UILink>
        <UILink to="/who-we-are">who we are v2</UILink>
        <UILink to="/about">about v2</UILink>
        <UILink to="/contact">contact v2</UILink> */}
      </nav>
    </header>
  );
};
export default UIHeader;
