import Decimal from "decimal.js";

export function add(left: number, right: number): number {
  return new Decimal(left).plus(right).toNumber();
}

export function subtract(left: number, right: number): number {
  return new Decimal(left).minus(right).toNumber();
}

export function multiply(left: number, right: number): number {
  return new Decimal(left).times(right).toNumber();
}

export function divide(left: number, right: number): number {
  return new Decimal(left).dividedBy(right).toNumber();
}

export function sum(values: readonly number[]): number {
  return values
    .reduce<Decimal>((acc, value) => acc.plus(value), new Decimal(0))
    .toNumber();
}

export function round(value: number, places = 0): number {
  return new Decimal(value)
    .toDecimalPlaces(places, Decimal.ROUND_HALF_UP)
    .toNumber();
}

export function floor(value: number): number {
  return new Decimal(value).floor().toNumber();
}

export function ceil(value: number): number {
  return new Decimal(value).ceil().toNumber();
}

export function clamp(value: number, min: number, max: number): number {
  return Decimal.min(max, Decimal.max(min, value)).toNumber();
}
