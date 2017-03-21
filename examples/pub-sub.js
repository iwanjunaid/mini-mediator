const Mediator = require('../index');
const mediator = new Mediator();
const winston = require('winston');

class MiniMath {
  setMediator(mediator) {
    this.mediator = mediator;
    this.setupListeners();
  }

  setupListeners() {
    if (this.mediator) {
      const self = this;

      this.mediator.registerListener('request.for.add', function(data) {
        const result = self.calculateAdd(data.firstVal, data.secondVal);

        self.mediator.emit('result', {
          firstVal: data.firstVal,
          secondVal: data.secondVal,
          result: result
        });
      });  
    }
  }

  calculateAdd(firstVal, secondVal) {
    return firstVal + secondVal;
  }
}

class OtherComponent {
  setMediator(mediator) {
    this.mediator = mediator;
    this.setupListeners();
  }

  setupListeners() {
    if (this.mediator) {
      this.mediator.registerListener('result', function(data) {
        winston.log('info', `Receive result for ${data.firstVal} + ${data.secondVal} = ${data.result}`);
      });    
    }
  }

  calculate5Plus3() {
    const reqData = {
      firstVal: 5,
      secondVal: 3
    };

    winston.log('info', `Request calculation for ${reqData.firstVal} + ${reqData.secondVal}`);
    this.mediator.emit('request.for.add', reqData);
  }
}

const miniMath = new MiniMath();
const otherComponent = new OtherComponent();

mediator.register('MiniMath', miniMath);
mediator.register('OtherComponent', otherComponent);

otherComponent.calculate5Plus3();

