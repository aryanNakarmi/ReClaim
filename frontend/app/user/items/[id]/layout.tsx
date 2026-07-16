import { ReactNode } from "react";

interface ItemDetailLayoutProps {
  children: ReactNode;
}

export default function ItemDetailLayout({
  children,
}: ItemDetailLayoutProps) {
  return <>{children}</>;
}
