declare namespace jest {
  interface It {
    flat<Context>(
      title: string,
      suite: (context: Context) => Promise<any>,
      before?: () => Promise<Context>,
      after?: (context: Context) => Promise<any>
    ): void
  }
}
