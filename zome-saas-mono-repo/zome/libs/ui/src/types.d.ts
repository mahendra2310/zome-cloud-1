declare module '*.less'
declare module '*.png'
declare module '*.jpg'
/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '*.svg' {
  const content: any
  export const ReactComponent: any
  export default content
}

declare module '*.less' {
  const classes: {[key: string]: string};
  export default classes;
}