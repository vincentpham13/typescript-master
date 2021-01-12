import 'reflect-metadata';

function main() {
  const humanNameMetadataKey = Symbol('humanName');

  function humanName(
    target: any,
    propertyKey: string,
    parameterIndex: number
  ) {
    const humanNameParameters: number[]
      = Reflect.getOwnMetadata(
        humanNameMetadataKey,
        target,
        propertyKey,
      ) || [];
    humanNameParameters.unshift(parameterIndex);
    Reflect.defineMetadata(
      humanNameMetadataKey,
      humanNameParameters,
      target,
      propertyKey,
    )
  }

  function validate(
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<any>
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      console.log('checking before returning');
      const humanNameParameters = Reflect.getOwnMetadata(
        humanNameMetadataKey,
        target,
        propertyKey,
      );

      if (humanNameParameters) {
        for (let humanNameParamIndex of humanNameParameters) {
          const value = arguments[humanNameParamIndex];
          if (!/^[a-zA-Z\s]*$/.test(value)) {
            throw new Error('Invalid human name.');
          }
        }
      }

      return originalMethod.apply(this, args);
    }
  }

  class Student {
    private _name: string;
    constructor(name: string) {
      this._name = name;
    }

    @validate
    setName(@humanName name: string) {

      this._name = name;
    }

    getInfo() {
      return this._name
    }
  }

  const student = new Student("Nhat");
  student.setName("Vincent - Pham");
  console.log(student.getInfo());
}

main();