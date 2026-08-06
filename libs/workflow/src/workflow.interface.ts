export interface WorkflowStep<TContext, TResult> {
  name: string;
  execute(context: TContext): Promise<TResult>;
  compensate?(context: TContext, error: any): Promise<void>;
}

export interface Workflow<TContext> {
  name: string;
  steps: WorkflowStep<TContext, any>[];
  execute(initialContext: TContext): Promise<void>;
}
