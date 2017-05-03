const Mediator = require('../index.js');
const EventEmitter = require('events');

function registeredHandler(data) {
  const mediator = this.mediator;

  mediator.unregisterListener('registered', registeredHandler);
  expect(data.component).to.eql(data.component);
  expect(data.isRegistered(data.component)).to.be.true;
  this.done();
}

class Triangle {
  setMediator(mediator, setupDone) {
    this.mediator = mediator;
    this.setup();
    setupDone();
  }

  setup() {
    const self = this;
    const mediator = self.mediator;

    mediator.registerListener('calculate', (data) => {
      const base = data.base;
      const height = data.height;
      const area = self.calculateArea(base, height);

      mediator.emit('result', { area });
    });
  }

  calculateArea(base, height) {
    return 0.5 * base * height;
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

    mediator.callApi('Triangle', 'Area', { base, height }, (err, area) => {
      return callback(err, area);
    });
  }

  calculateTriangleAreaAsync(base, height) {
    const self = this;
    const mediator = self.mediator;

    return mediator.callApiAsync('Triangle', 'Area', { base, height });
  }

  requestCalculateTriangleArea(base, height) {
    const self = this;
    const mediator = self.mediator;

    mediator.emit('calculate', { base, height });
  }
}

describe('Class MiniMediator', () => {
  const mediator = new Mediator();
  const triangle = new Triangle();

  beforeEach(() => {
    mediator.remove('Triangle');
    mediator.remove('Consumer');
  });

  it('Should has Triangle component', () => {
    mediator.register('Triangle', triangle);
    const triangleFound = mediator.hasComponent('Triangle');

    expect(triangleFound).to.be.true;
  });

  it('Should emit registered event', (done) => {
    const newMediator = new Mediator();
    const component = 'Triangle';
    const context = {
      mediator: newMediator,
      component,
      done,
    };

    newMediator.registerListener('registered', registeredHandler.bind(context));
    newMediator.register('Triangle', triangle);
  });

  it('Should has Area api', () => {
    mediator.register('Triangle', triangle);

    expect(mediator.hasApi('Triangle', 'Area')).to.be.true;
  });

  it('Should not have UnknownApi api', () => {
    mediator.register('Triangle', triangle);

    expect(mediator.hasApi('UnknownDomain', 'UnknownApi')).to.be.false;
    expect(mediator.hasApi('Triangle', 'UnknownApi')).to.be.false;
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

    mediator.register('Triangle', {});
    const countComponents = mediator.count();

    expect(countComponents).to.eql(1);
  });

  it('Should return API not found error if a call to undefined API occurs', (done) => {
    mediator.register('Triangle', triangle);
    mediator.callApi('Triangle', 'NonExistenceApi', {}, (err) => {
      expect(err.message).to.eql('API not found!');
      done();
    });
  });

  it('Should return error if call to unregistered component', (done) => {
    mediator.callApi('UnregisteredComponent', 'NonExistenceApi', {}, (err) => {
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

    consumer.calculateTriangleArea(2, 5, (err, area) => {
      expect(area).to.eql(5);
      done();
    });
  });

  it('Should return 5 for area result for Triangle with base 2 height 5 using Promise', () => {
    mediator.register('Triangle', triangle);
    mediator.register('Consumer', consumer);

    return consumer.calculateTriangleAreaAsync(2, 5)
      .then((area) => {
        expect(area).to.eql(5);
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
