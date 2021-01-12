function main() {
  function enumarable(
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<any>
  ) {
    descriptor.enumerable = true;
    return descriptor;
  }

  class Student {
    private _name: string;
    constructor(name: string) {
      this._name = name;
    }

    @enumarable
    getInfo() {
      // do sth
      return this._name;
    }
  }

  const student = new Student("Nhat");
}

main();