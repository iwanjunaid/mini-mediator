const assert = require('assert');
const EventEmitter = require('events');

class Triangle {
  setMediator(mediator) {
    this.mediator = mediator;
    this.setup();
  }

  setup() {
    const self = this;
    const mediator = self.mediator;

    mediator.registerListener('calculate', (data) => {
      const base = data.base;
      const height = data.height;
      const area = self.calculateArea(base, height);

      mediator.emit('result', {area});
    });
  }

  calculateArea(base, height) {
    const area = 0.5 * base * height;

    return area;
  }

  apiArea(args, callback) {
    const base = args.base;
    const height = args.height;
    const area = this.calculateArea(base, height);

    return callback(null, area);
  }
}

class Consumer extends EventEmitter {
  setMediator(mediator) {
    this.mediator = mediator;
    this.setup();
  }

  setup() {
    const self = this;
    const mediator = self.mediator;
    
    mediator.registerListener('result', (data) => {
      self.emit('result', data); 
    });
  }

  calculateTriangleArea(base, height, callback) {
    const self = this;
    const mediator = self.mediator;

    mediator.callApi('Triangle', 'Area', {base, height}, (err, area) => {
      return callback(err, area); 
    });
  }

  requestCalculateTriangleArea(base, height) {
    const self = this;
    const mediator = self.mediator;

    mediator.emit('calculate', {base, height});
  }
}

describe('Class MiniMediator', () => {
  const mediator = new Mediator();
  const triangle = new Triangle();

  it('Should has Triangle component', () => {
    mediator.register('Triangle', triangle);
    const triangleFound = mediator.hasComponent('Triangle');

    expect(triangleFound).to.be.true;
  });

  it('Should has exactly one component registered', () => {
    mediator.register('Triangle', triangle);
    const countComponents = mediator.count();

    expect(countComponents).to.eql(1);
  });

  it('Should has exactly zero component registered', () => {
    mediator.register('Triangle', triangle);
    mediator.remove('Triangle');
    const countComponents = mediator.count();

    expect(countComponents).to.eql(0);
  });

  it('Should returns same Triangle object', () => {
    mediator.register('Triangle', triangle);
    const returnedObject = mediator.getComponent('Triangle');

    expect(returnedObject).to.eql(triangle);
  });

  it('Should not add component with the same name', () => {
    mediator.register('Triangle', triangle);

    mediator.register('Triangle', new Object());
    const countComponents = mediator.count();

    expect(countComponents).to.eql(1);
  });

  it('Should return error if call to unregistered component', (done) => {
    mediator.callApi('UnregisteredComponent', 'NonExistenceApi', {}, (err, arr) => {
      expect(err.message).to.eql('Component not found!');
      done();
    });
  });
});

describe('Request-reply communication', () => {
  const mediator = new Mediator();
  const triangle = new Triangle();
  const consumer = new Consumer();

  it('Should return 5 for area result for Triangle with base 2 height 5', (done) => {
    mediator.register('Triangle', triangle);
    mediator.register('Consumer', consumer);

    
    const area = consumer.calculateTriangleArea(2, 5, (err, area) => {
      expect(area).to.eql(5);
      done();
    });
  });
});

describe('Pub-sub communication', () => {
  const mediator = new Mediator();
  const triangle = new Triangle();
  const consumer = new Consumer();

  it('Should receive 5 for area result for Triangle with base 2 height 5', (done) => {
    mediator.register('Triangle', triangle);
    mediator.register('Consumer', consumer);

    consumer.on('result', (data) => {
      expect(data.area).to.eql(5);
      done();
    });

    consumer.requestCalculateTriangleArea(2, 5); 
  });
});
