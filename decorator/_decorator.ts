import 'reflect-metadata';

function f() {
  // this is the function factory
  console.log('f(): evaluated');
  return function (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
    // this is the decorator
    // so sth with target and value
    console.log("f(): called");
  }
}

function g(sth: any) {
  // this is the function factory
  console.log('g(): evaluated');
  return function (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
    // this is the decorator
    // so sth with target and value
    console.log("g(): called", target, propertyKey, sth);
  }
}

function seal<T extends { new(...args: any[]): {} }>(constructor: T) {
  console.log('seal(): called');
  Object.seal(constructor);
  Object.seal(constructor.prototype);


  return class extends constructor {
    name = "Vincent";
    age = 26;
  }
}

function enumerable(value: boolean) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<any>
  ) {
    descriptor.enumerable = value;
  }
}

function main() {
  @seal
  class C {

    address: string = '';
    constructor(private text: string) {

    }

    @f()
    @g(1000)
    method() {

    }

    @enumerable(false)
    getText() {
      return this.text;
    }

    @enumerable(false)
    get getAddress() {
      return this.address;
    }

  }
  // const cInstance = new C('this is text');


  function configurable(value: boolean) {
    return function (
      target: any,
      propertyKey: string,
      descriptor: TypedPropertyDescriptor<any>
    ) {
      descriptor.configurable = value;
    }
  }

  const formatMetadataKey = Symbol("format");
  function format(formatString: string) {
    return Reflect.metadata(formatMetadataKey, formatString);
  }

  function getFormat(target: any, propertyKey: string) {
    return Reflect.getMetadata(formatMetadataKey, target, propertyKey);
  }

  class Point {
    private _x: number;
    private _y: number;

    @format('This is, %s')
    private greeting: string;

    constructor(message: string, x: number, y: number) {
      this.greeting = message;
      this._x = x;
      this._y = y;
    }

    @configurable(false)
    set x(value: number) {
      this._x = value;
    }

    @enumerable(true)
    set y(value: number) {
      this._x = value;
    }

    get greet() {
      let formattedString = getFormat(this, "greeting");
      return formattedString.replace('%s', this.greeting);
    }
  }

  const point = new Point('Point A', 1, 3);
  point.x = 100;
  point.y = 100;
  // console.log(point.greet);

  /* Property decorator */

  const requiredMetadataKey = Symbol('required');

  function required(
    target: any,
    propertyKey: string,
    parameterIndex: number,
  ) {
    const requiredParameters: number[] =
      Reflect.getOwnMetadata(requiredMetadataKey, target, propertyKey) || [];

    requiredParameters.unshift(parameterIndex);

    Reflect.defineMetadata(
      requiredMetadataKey,
      requiredParameters,
      target,
      propertyKey,
    );
  }

  const maxMetadataKey = Symbol("max");
  interface IMax {
    index: number;
    value: number;
  }

  function max(length: number) {
    return function (
      target: any,
      propertyKey: string,
      parameterIndex: number
    ) {
      const maxParameters: IMax[] =
        Reflect.getOwnMetadata(maxMetadataKey, target, propertyKey) || [];

      maxParameters.unshift({
        index: parameterIndex,
        value: length,
      });

      Reflect.defineMetadata(maxMetadataKey, maxParameters, target, propertyKey);
    }
  }

  function validate(
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<any>
  ) {
    let method = descriptor.value;
    descriptor.value = function () {

      // Validate required fields
      let requiredParameters: number[] = Reflect.getOwnMetadata(
        requiredMetadataKey,
        target,
        propertyKey
      );

      if (requiredParameters) {
        for (let paramIndex of requiredParameters) {
          if (paramIndex >= arguments.length || arguments[paramIndex] === undefined) {
            throw new Error('Missing required parameters');
          }
        }
      }

      // Validate numberic fields
      const maxParameters: IMax[] = Reflect.getOwnMetadata(
        maxMetadataKey,
        target,
        propertyKey,
      )
      if (maxParameters) {
        for (let maxParam of maxParameters) {
          const val = arguments[maxParam.index];
          const maxLength = maxParam.value;
          switch (typeof val) {
            case "string":
              if (val.length > maxLength)
                throw new Error(`This field must not be greater than, ${maxLength}`);
              break;
            case "number":
              if (val > maxLength)
                throw new Error(`This field must not be greater than, ${maxLength}`);
              break;
            default:
              break;
          }
        }
      }

      return method?.apply(this, arguments);
    }
  }

  class Greeter {
    private greeting: string;

    constructor(greet: string) {
      this.greeting = greet;
    }

    @validate
    greet(@required @max(20) name: string, @required @max(30) age: number) {
      return `Hello ${name}, you're ${age} years old, ${this.greeting}`;
    }
  }

  const greeter = new Greeter("Nice to meet you");
  console.log(greeter.greet('Pham Hoang Minh Nhat Pham Hoang Minh Nhat', 31));
}

main();