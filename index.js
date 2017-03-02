const EventEmitter = require('events');

class MiniMediator extends EventEmitter {
  constructor(apiPrefix) {
    super();
    this.components = {};
    this.apiPrefix = apiPrefix || 'api';
  }

  register(name, component) {
    let cmp, proceed = true;

    for (cmp in this.components) {
      if (this.components[cmp] === component) {
        proceed = false;
        break;
      } else if (cmp === name) {
        proceed = false;
        break;
      }
    }

    if (proceed) {
      if (typeof component['setMediator'] === 'function') {
        component.setMediator(this);
      }

      this.components[name] = component;
    }
  }

  remove(name) {
    if (name in this.components) {
      delete this.components[name];
    }
  }

  hasComponent(name) {
    return this.components[name] !== undefined;
  }

  getComponent(name) {
    return this.components[name];
  }

  count() {
    return Object.keys(this.components).length;
  }

  callApi(name, api, args, callback) {
    if (this.hasComponent(name)) {
      let component = this.getComponent(name);
      const fullApiName = this.apiPrefix + api;

      if (typeof component[fullApiName] === 'function') {
        return component[fullApiName].call(component, args, callback);
      }
    } else {
      return callback(new Error('Component not found!'));
    }
  }

  registerListener(eventName, callback) {
    this.addListener(eventName, callback);
  }
}

module.exports = MiniMediator;

