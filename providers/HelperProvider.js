'use strict'

const { ServiceProvider } = require('@adonisjs/fold')
const Helpers = use('App/Helpers');
const Helper = use('Helpers');
class HelperProvider extends ServiceProvider {
  /**
   * Register namespaces to the IoC container
   *
   * @method register
   *
   * @return {void}
   */
  register () {
    this.app.singleton('Adonis/Helpers', () => new Helpers(Helper.appRoot()))
    this.app.alias('Adonis/Helpers', 'Help')
  }

  /**
   * Attach context getter when all providers have
   * been registered
   *
   * @method boot
   *
   * @return {void}
   */
  boot () {
    const View = use('View');
    const Help = new Helpers;
    View.global('currentTime', function () {
      return new Date().getTime()
    })
    View.global('help', Help);
  }
}

module.exports = HelperProvider
