const EventEmitter = require('events');

class MiniMediator extends EventEmitter {
  constructor(apiPrefix) {
    super();
    this.components = {};
    this.apiPrefix = apiPrefix || 'api';
  }

  register(name, component) {
    let proceed = true;
    const self = this;
    const components = this.components;

    Object.keys(components).forEach((cmp) => {
      if (components.hasOwnProperty.call(components, cmp)) {
        let breakFor = false;

        if (components[cmp] === component || cmp === name) {
          proceed = false;
          breakFor = true;
        }

        if (breakFor) {
          return false;
        }
      }

      return true;
    });

    if (proceed) {
      if (typeof component.setMediator === 'function') {
        component.setMediator(this, () => {
          self.emit('registered', { component: name });
        });
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

  hasApi(domain, api) {
    if (this.hasComponent(domain)) {
      const component = this.getComponent(domain);
      const fullApiName = this.apiPrefix + api;

      if (typeof component[fullApiName] === 'function') {
        return true;
      }

      return false;
    }

    return false;
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

      return callback(new Error('API not found!'));
    }

    return callback(new Error('Component not found!'));
  }

  registerListener(eventName, listener) {
    this.addListener(eventName, listener);
  }

  unregisterListener(eventName, listener) {
    this.removeListener(eventName, listener);
  }
}

module.exports = MiniMediator;

