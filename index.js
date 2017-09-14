const EventEmitter = require('events');
const Promise = require('bluebird');
const until = require('async/until');
const each = require('async/each');
const setImmediate = require('async/setImmediate');

class MiniMediator extends EventEmitter {
  constructor(apiPrefix) {
    super();

    this.components = {};
    this.registered = [];
    this.apiPrefix = apiPrefix || 'api';
  }

  register(name, component) {
    let proceed = true;
    const self = this;
    const components = this.components;
    const registered = this.registered;

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
          registered.push(name);
          components[name] = component;

          self.emit('registered', {
            component: name,
            members: registered,
            isRegistered: search => self.registered.indexOf(search) > -1,
          });
        });
      }
    }
  }

  remove(name) {
    if (name in this.components) {
      delete this.components[name];
    }

    const index = this.registered.indexOf(name);

    if (index > -1) {
      this.registered.splice(index, 1);
    }
  }

  isRegistered(name) {
    return this.registered.indexOf(name) !== -1;
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

  callApiPromise(name, api, args) {
    return Promise.fromCallback(this.callApi.bind(this, name, api, args));
  }

  registerListener(eventName, listener) {
    this.addListener(eventName, listener);
  }

  unregisterListener(eventName, listener) {
    this.removeListener(eventName, listener);
  }

  waitFor(...args) {
    const callback = args.pop();
    if (typeof callback !== 'function') throw new Error('callback is not function.');

    const self = this;
    let depsArr = [];
    if (Array.isArray(args[0])) {
      depsArr = depsArr.concat(args[0]);
    } else {
      depsArr = args;
    }

    const count = depsArr.length;
    let registeredCount = 0;

    until(
      () => count === registeredCount,
      (untilCb) => {
        registeredCount = 0;

        each(depsArr, (dep, eachCb) => {
          if (self.isRegistered(dep)) {
            registeredCount += 1;
          }

          setImmediate(eachCb);
        }, () => {
          setImmediate(untilCb);
        });
      },
      () => {
        const promises = [];

        depsArr.forEach((dep, index) => {
          promises[index] = self.callApiPromise(dep, 'Default', null)
            .then(result => result)
            .catch(() => null);
        });

        Promise.all(promises)
          .then(results => callback(...results));
      },
    );
  }
}

module.exports = MiniMediator;
