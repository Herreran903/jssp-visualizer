"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/instances", label: "INSTANCIAS" },
  { href: "/configure", label: "CONFIGURAR" },
  { href: "/run", label: "EJECUTAR" },
];

function comparePathnames(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (pathname === href) return true;
  return pathname.startsWith(href.endsWith("/") ? href : href + "/");
}

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-3" aria-label="Secciones">
      {links.map((link) => {
        const isActive = comparePathnames(pathname, link.href);
        return (
          <div className="flex flex-col items-center" key={link.href}>
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className={
                "transition-colors text-(--color-text-secondary) hover:text-(--color-accent) hover:underline underline-offset-4 font-hand text-xl"
              }
            >
              {link.label}
            </Link>
            {isActive && (
              <div className="mt-1 h-1 w-20 bg-(--color-accent) rounded-full" />
            )}
          </div>
        );
      })}
    </nav>
  );
}
