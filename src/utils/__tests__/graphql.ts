import { Field } from '../../types/types'
import { isScalar, isNonScalarList } from '../graphql'
import '../polyfils'

describe('isScalar', () => {
  const scalarTypes = [
    'String',
    'Int',
    'Float',
    'Boolean',
    'GraphQLID',
    'Enum',
    'Password',
    'DateTime',
  ]

  it('checks if every item of scalarTypes is a valid ScalarType', () => {
    for (const type of scalarTypes) {
      expect(isScalar(type)).toBe(true)
    }
  })

  it('checks if item not in the scalarTypes is an invalid ScalarType', () => {
    const identifier = 'Relation'
    expect(isScalar(identifier)).toBe(false)
  })
})

describe('isNonScalarList', () => {
  const testField: Field = {
    id: '',
    name: '',
    description: '',
    isRequired: true,
    isList: false,
    isUnique: false,
    isSystem: false,
    isReadonly: false,
    typeIdentifier: 'Int',
    model: undefined,
  }

  it('checks if a NonScalar List Field is a valid NonScalar List', () => {
    const field: Field = {
      ...testField,
      typeIdentifier: 'Relation',
      isList: true,
    }
    expect(isNonScalarList(field)).toBe(true)
  })

  it('checks if a Scalar List is not a NonScalar List', () => {
    const field: Field = {
      ...testField,
      typeIdentifier: 'String',
      isList: true,
    }
    expect(isNonScalarList(field)).toBe(false)
  })

  it('checks if a NonScalar Value is not a NonScalar List', () => {
    const field: Field = {
      ...testField,
      typeIdentifier: 'Hello World' as any,
      isList: false,
    }
    expect(isNonScalarList(field)).toBe(false)
  })

  it('checks if a Scalar value is not a NonScalar List', () => {
    const field: Field = {
      ...testField,
      typeIdentifier: 'String',
      isList: false,
    }
    expect(isNonScalarList(field)).toBe(false)
  })
})
