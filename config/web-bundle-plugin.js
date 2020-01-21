// A webpack plugin which generates web bundle output.
const mime = require("mime");
const { BundleBuilder } = require("wbn");
const { RawSource } = require("webpack-sources");

const defaults = {
  output: 'out.wbn'
}

module.exports = class WebBundlePlugin {
  constructor(opts) {
    this.opts = Object.assign({}, defaults, { primaryURL: opts.baseURL }, opts);
  }

  apply(compiler) {
    compiler.hooks.emit.tap(
      'WebBundlePlugin',
      (compilation) => {
        const builder = new BundleBuilder(this.opts.primaryURL || this.opts.baseURL);

        for (const key of Object.keys(compilation.assets)) {
          // 'dir/index.html' is stored as 'dir/' in WBN.
          const url = new URL(key, this.opts.baseURL).toString().replace(/\/index.html$/, '/');
          const headers = {
            'Content-Type': mime.lookup(key) || 'application/octet-stream',
            'Access-Control-Allow-Origin': '*'
          };
          const source = compilation.assets[key].source();
          const content = Buffer.isBuffer(source) ? source : Buffer.from(source);
          builder.addExchange(url, 200, headers, content);
          console.log([key, compilation.assets[key].source().length || compilation.assets[key].source()]);
        }
        compilation.assets[this.opts.output] = new RawSource(builder.createBundle());
      }
    );
  }
}
