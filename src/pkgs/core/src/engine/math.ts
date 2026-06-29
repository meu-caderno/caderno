import Decimal from "decimal.js";

export function add(a: number, b: number): number {
  return new Decimal(a).plus(b).toNumber();
}

export function subtract(a: number, b: number): number {
  return new Decimal(a).minus(b).toNumber();
}

export function multiply(a: number, b: number): number {
  return new Decimal(a).times(b).toNumber();
}

export function divide(a: number, b: number): number {
  return new Decimal(a).dividedBy(b).toNumber();
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
