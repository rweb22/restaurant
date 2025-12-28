'use strict';

const { Model } = require('sequelize');
const { serializeDate } = require('../utils/dateSerializer');

module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    static associate(models) {
      // Transaction belongs to Order
      Transaction.belongsTo(models.Order, {
        foreignKey: 'order_id',
        as: 'order',
        onDelete: 'SET NULL'
      });
    }

    toSafeObject() {
      return {
        id: this.id,
        orderId: this.orderId,
        paymentGateway: this.paymentGateway,
        gatewayOrderId: this.gatewayOrderId,
        gatewayPaymentId: this.gatewayPaymentId,
        gatewaySignature: this.gatewaySignature,
        amount: parseFloat(this.amount),
        currency: this.currency,
        status: this.status,
        paymentMethod: this.paymentMethod,
        upiVpa: this.upiVpa,
        cardNetwork: this.cardNetwork,
        cardLast4: this.cardLast4,
        bankName: this.bankName,
        walletName: this.walletName,
        errorCode: this.errorCode,
        errorDescription: this.errorDescription,
        metadata: this.metadata,
        createdAt: serializeDate(this.createdAt),
        updatedAt: serializeDate(this.updatedAt)
      };
    }
  }

  Transaction.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'order_id',
        references: {
          model: 'orders',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      paymentGateway: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'upigateway',
        field: 'payment_gateway'
      },
      gatewayOrderId: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'gateway_order_id'
      },
      gatewayPaymentId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'gateway_payment_id'
      },
      gatewaySignature: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'gateway_signature'
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'amount',
        validate: {
          min: {
            args: [0],
            msg: 'Amount must be non-negative'
          }
        }
      },
      currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: 'INR',
        field: 'currency'
      },
      status: {
        type: DataTypes.ENUM('created', 'authorized', 'captured', 'failed', 'refunded'),
        allowNull: false,
        defaultValue: 'created',
        field: 'status',
        validate: {
          isIn: {
            args: [['created', 'authorized', 'captured', 'failed', 'refunded']],
            msg: 'Invalid transaction status'
          }
        }
      },
      paymentMethod: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'payment_method'
      },
      upiVpa: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'upi_vpa'
      },
      cardNetwork: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'card_network'
      },
      cardLast4: {
        type: DataTypes.STRING(4),
        allowNull: true,
        field: 'card_last4'
      },
      bankName: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'bank_name'
      },
      walletName: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'wallet_name'
      },
      errorCode: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'error_code'
      },
      errorDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'error_description'
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'metadata'
      }
    },
    {
      sequelize,
      modelName: 'Transaction',
      tableName: 'transactions',
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ['order_id'] },
        { fields: ['gateway_order_id'] },
        { fields: ['gateway_payment_id'] },
        { fields: ['status'] },
        { fields: ['created_at'] }
      ]
    }
  );

  return Transaction;
};

