const EventEmitter = require('events');

class MiniMediator extends EventEmitter {
  constructor(apiPrefix) {
    super();
    this.components = {};
    this.apiPrefix = apiPrefix || 'api';
  }

  register(name, component) {
    let cmp, proceed = true;
    const components = this.components;

    for (cmp in components) {
      if (components.hasOwnProperty(cmp)) {
        let breakFor = false;

        if (components[cmp] === component || cmp === name) {
          proceed = false;
          breakFor = true;
        }

        if (breakFor) {
          break;
        }
      }
    }

    if (proceed) {
      if (typeof component['setMediator'] === 'function') {
        component.setMediator(this);
      }

      components[name] = component;
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
      const component = this.getComponent(name);
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

