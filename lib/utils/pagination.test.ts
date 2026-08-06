import { describe, expect, it } from 'vitest'
import { parsePageParams } from './pagination'

describe('parsePageParams', () => {
  it('übernimmt eine gültige Seite', () => {
    expect(parsePageParams({ page: '3' })).toEqual({ page: 3, pageSize: 25, skip: 50, take: 25 })
  })

  it('fällt auf Seite 1 zurück, wenn der Parameter fehlt', () => {
    expect(parsePageParams({})).toEqual({ page: 1, pageSize: 25, skip: 0, take: 25 })
  })

  it('fällt auf Seite 1 zurück, wenn der Parameter nicht-numerisch ist', () => {
    expect(parsePageParams({ page: 'abc' })).toEqual({ page: 1, pageSize: 25, skip: 0, take: 25 })
  })

  it('fällt auf Seite 1 zurück, wenn der Parameter negativ ist', () => {
    expect(parsePageParams({ page: '-5' })).toEqual({ page: 1, pageSize: 25, skip: 0, take: 25 })
  })
})
