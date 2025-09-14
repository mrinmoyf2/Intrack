// src/components/ErrorBoundary.tsx
"use client";
import { Component, ReactNode } from "react";

export default class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return <div className="rounded border bg-red-50 p-4 text-red-700">Something went wrong.</div>;
    return this.props.children;
  }
}