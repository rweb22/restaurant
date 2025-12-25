'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      // Order belongs to User
      Order.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'SET NULL'
      });

      // Order belongs to Address
      Order.belongsTo(models.Address, {
        foreignKey: 'address_id',
        as: 'address',
        onDelete: 'SET NULL'
      });

      // Order belongs to Offer (optional)
      Order.belongsTo(models.Offer, {
        foreignKey: 'offer_id',
        as: 'offer',
        onDelete: 'SET NULL'
      });

      // Order has many OrderItems
      Order.hasMany(models.OrderItem, {
        foreignKey: 'order_id',
        as: 'orderItems',
        onDelete: 'CASCADE'
      });

      // Order has many Transactions
      Order.hasMany(models.Transaction, {
        foreignKey: 'order_id',
        as: 'transactions',
        onDelete: 'SET NULL'
      });

      // Order has many Notifications
      Order.hasMany(models.Notification, {
        foreignKey: 'order_id',
        as: 'notifications',
        onDelete: 'SET NULL'
      });
    }

    toSafeObject() {
      return {
        id: this.id,
        userId: this.userId,
        addressId: this.addressId,
        offerId: this.offerId,
        status: this.status,
        paymentStatus: this.paymentStatus,
        paymentMethod: this.paymentMethod,
        paymentGatewayOrderId: this.paymentGatewayOrderId,
        paymentGatewayPaymentId: this.paymentGatewayPaymentId,
        subtotal: parseFloat(this.subtotal),
        gstAmount: parseFloat(this.gstAmount),
        discountAmount: parseFloat(this.discountAmount),
        deliveryCharge: parseFloat(this.deliveryCharge),
        totalPrice: parseFloat(this.totalPrice),
        specialInstructions: this.specialInstructions,
        deliveryAddress: this.deliveryAddress,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      };
    }
  }

  Order.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'user_id',
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      addressId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'address_id',
        references: {
          model: 'addresses',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      offerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'offer_id',
        references: {
          model: 'offers',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      status: {
        type: DataTypes.ENUM('pending_payment', 'pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending_payment',
        field: 'status',
        validate: {
          isIn: {
            args: [['pending_payment', 'pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'completed', 'cancelled']],
            msg: 'Invalid order status'
          }
        }
      },
      paymentStatus: {
        type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'refunded'),
        allowNull: false,
        defaultValue: 'pending',
        field: 'payment_status',
        validate: {
          isIn: {
            args: [['pending', 'processing', 'completed', 'failed', 'refunded']],
            msg: 'Invalid payment status'
          }
        }
      },
      paymentMethod: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'payment_method'
      },
      paymentGatewayOrderId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'payment_gateway_order_id'
      },
      paymentGatewayPaymentId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'payment_gateway_payment_id'
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'subtotal',
        validate: {
          min: {
            args: [0],
            msg: 'Subtotal must be non-negative'
          }
        }
      },
      gstAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'gst_amount',
        validate: {
          min: {
            args: [0],
            msg: 'GST amount must be non-negative'
          }
        }
      },
      discountAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'discount_amount',
        validate: {
          min: {
            args: [0],
            msg: 'Discount amount must be non-negative'
          }
        }
      },
      deliveryCharge: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'delivery_charge',
        validate: {
          min: {
            args: [0],
            msg: 'Delivery charge must be non-negative'
          }
        }
      },
      totalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'total_price',
        validate: {
          min: {
            args: [0],
            msg: 'Total price must be non-negative'
          }
        }
      },
      specialInstructions: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'special_instructions'
      },
      deliveryAddress: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'delivery_address'
      }
    },
    {
      sequelize,
      modelName: 'Order',
      tableName: 'orders',
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ['user_id'] },
        { fields: ['status'] },
        { fields: ['payment_status'] }
      ]
    }
  );

  return Order;
};

