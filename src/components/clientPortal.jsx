"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function ClientPortal({ children, selector }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  const element = document.querySelector(selector) || document.body;
  return createPortal(children, element);
}
