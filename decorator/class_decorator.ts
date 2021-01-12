function main() {
  function welcome<T extends { new(...args: any[]): any }>(constructor: T) {
    return class extends constructor {
      greeting: string = 'Welcome to Harvard university';
    }
  }

  @welcome
  class Student {
    constructor(name: string) {

    }
  }

  const student = new Student("Nhat");
  console.log(student);
}

main();