module.exports = function (RED) {
  function updateProperty(config) {
    RED.nodes.createNode(this, config);

    this.ozmapconnection = RED.nodes.getNode(config.ozmapconnection);
    this.status({});
    this.on('input', async (msg) => {
      const ozmap = msg.ozmap || this.ozmapconnection?.ozmap;
      if (!ozmap) {
        msg.payload = 'Missing ozmap connection';
        return [msg, null];
      }
      this.status({ fill: 'blue', shape: 'ring', text: 'running' });

      ozmap.property
        .updateById(msg.payload?.id, msg.payload?.data)
        .then((data) => {
          msg.payload = data || 'Property updated';
          this.status({});
          return this.send([null, msg]);
        })
        .catch((error) => {
          const statusMessages = {
            401: 'Unauthorized',
            503: 'Service Unavailable',
          };
          const message = statusMessages[error.status] || error.name || 'unknown error';
          this.status({ fill: 'red', shape: 'ring', text: message });

          msg.payload = error;
          return this.send([msg, null]);
        });
    });
  }

  RED.nodes.registerType('updateProperty', updateProperty);
};
