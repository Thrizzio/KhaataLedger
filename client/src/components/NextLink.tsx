"use client";

import * as React from 'react';
import Link, { type LinkProps } from 'next/link';
import type { AnchorHTMLAttributes, ForwardedRef } from 'react';

type NextLinkComposedProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & Omit<LinkProps, 'href'> & {
  href: LinkProps['href'];
};

const NextLink = React.forwardRef<HTMLAnchorElement, NextLinkComposedProps>(function NextLink(
  props,
  ref: ForwardedRef<HTMLAnchorElement>,
) {
  const {
    href,
    replace,
    scroll,
    shallow,
    passHref,
    prefetch,
    locale,
    ...other
  } = props;

  return (
    <Link
      href={href}
      replace={replace}
      scroll={scroll}
      shallow={shallow}
      passHref={passHref}
      prefetch={prefetch}
      locale={locale}
      ref={ref}
      {...other}
    />
  );
});

export default NextLink;
