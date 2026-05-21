"use client";

import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

type SiteNavigationProps = {
  /** Navy header — white triggers */
  variant?: "dark" | "light";
  className?: string;
};

const menuLinkClass =
  "block cursor-pointer select-none rounded-lg p-3 leading-none no-underline outline-none transition-colors duration-200 hover:bg-surface focus:bg-surface focus-visible:ring-2 focus-visible:ring-teal";

function MenuLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description?: string;
}) {
  return (
    <NavigationMenuLink asChild>
      <Link href={href} className={menuLinkClass}>
        <div className="text-body font-medium text-navy">{title}</div>
        {description ? (
          <p className="mt-1 line-clamp-2 text-meta text-ink/55">{description}</p>
        ) : null}
      </Link>
    </NavigationMenuLink>
  );
}

export function SiteNavigation({
  variant = "dark",
  className,
}: SiteNavigationProps) {
  const triggerClass =
    variant === "dark"
      ? "text-white/80 hover:bg-white/10 hover:text-white data-[state=open]:text-white"
      : "text-ink/70 hover:bg-surface hover:text-navy data-[state=open]:text-navy";

  const simpleLinkClass = cn(
    navigationMenuTriggerStyle,
    triggerClass,
    "cursor-pointer bg-transparent",
  );

  return (
    <NavigationMenu className={cn("hidden md:flex", className)}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className={triggerClass}>
            Company
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[280px] gap-1 p-2 sm:w-[320px]">
              <li>
                <MenuLink
                  href="#about"
                  title="About"
                  description="Precision design and AI-native architecture for education."
                />
              </li>
              <li>
                <MenuLink
                  href="#products"
                  title="Products"
                  description="BandForge, systems, and premium learning experiences."
                />
              </li>
              <li>
                <MenuLink
                  href="#contact"
                  title="Contact"
                  description="Early access and partnerships."
                />
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger className={triggerClass}>
            BandForge
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[300px] gap-1 p-2 sm:w-[380px] sm:grid-cols-2">
              <li className="sm:col-span-2">
                <MenuLink
                  href="/dashboard"
                  title="Candidate dashboard"
                  description="Progress, upcoming mocks, and recommended practice."
                />
              </li>
              <li>
                <MenuLink href="/scores" title="Score reports" />
              </li>
              <li>
                <MenuLink href="/admin" title="Admin preview" />
              </li>
              <li>
                <MenuLink href="/test/reading" title="Reading test" />
              </li>
              <li>
                <MenuLink href="/test/listening" title="Listening test" />
              </li>
              <li>
                <MenuLink href="/test/writing" title="Writing test" />
              </li>
              <li>
                <MenuLink href="/test/speaking" title="Speaking test" />
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/test/reading" className={simpleLinkClass}>
              Sample test
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
