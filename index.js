class MiniMediator {
  constructor() {
    this.components = {};
    this.apiPrefix = 'api';
  }

  register(name, component) {
    let cmp;

    for (cmp in this.components) {
      if (this.components[cmp] === component) {
        break;
      }
    }

    if (typeof component['setMediator'] === 'function') {
      component.setMediator(this);
    }

    this.components[name] = component;
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
}

module.exports = MiniMediator;

