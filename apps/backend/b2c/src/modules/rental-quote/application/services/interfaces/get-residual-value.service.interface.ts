export interface GetResidualValueServiceInput {
  skuId: string;
  contractPeriod: number;
  annualMileage: number;
}

export interface GetResidualValueServiceOutput {
  residualValue: number;
}

export interface GetResidualValueServicePort {
  execute(input: GetResidualValueServiceInput): Promise<GetResidualValueServiceOutput>;
}
