const { Schema, model } = require('mongoose');

const PurchaseAttemptSchema = new Schema({
  purchaseId: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['processing', 'completed', 'failed'],
  },
  responseStatus: {
    type: Number,
  },
  responseBody: {
    type: Schema.Types.Mixed,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// El intento se olvida al día. Un id vencido puede volver a enviar.
PurchaseAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 });

module.exports = model('PurchaseAttempt', PurchaseAttemptSchema);
