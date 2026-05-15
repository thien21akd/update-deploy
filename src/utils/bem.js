export function bindModule(styles) {
  return (...classNames) =>
    classNames
      .flatMap((className) =>
        typeof className === 'string'
          ? className
              .split(' ')
              .map((name) => styles[name])
              .filter(Boolean)
          : [],
      )
      .join(' ');
}
