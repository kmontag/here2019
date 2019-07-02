/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const frameplayer = $root.frameplayer = (() => {

    /**
     * Namespace frameplayer.
     * @exports frameplayer
     * @namespace
     */
    const frameplayer = {};

    frameplayer.protobuf = (function() {

        /**
         * Namespace protobuf.
         * @memberof frameplayer
         * @namespace
         */
        const protobuf = {};

        protobuf.Pixel = (function() {

            /**
             * Properties of a Pixel.
             * @memberof frameplayer.protobuf
             * @interface IPixel
             * @property {number|null} [r] Pixel r
             * @property {number|null} [g] Pixel g
             * @property {number|null} [b] Pixel b
             */

            /**
             * Constructs a new Pixel.
             * @memberof frameplayer.protobuf
             * @classdesc Represents a Pixel.
             * @implements IPixel
             * @constructor
             * @param {frameplayer.protobuf.IPixel=} [properties] Properties to set
             */
            function Pixel(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Pixel r.
             * @member {number} r
             * @memberof frameplayer.protobuf.Pixel
             * @instance
             */
            Pixel.prototype.r = 0;

            /**
             * Pixel g.
             * @member {number} g
             * @memberof frameplayer.protobuf.Pixel
             * @instance
             */
            Pixel.prototype.g = 0;

            /**
             * Pixel b.
             * @member {number} b
             * @memberof frameplayer.protobuf.Pixel
             * @instance
             */
            Pixel.prototype.b = 0;

            /**
             * Creates a new Pixel instance using the specified properties.
             * @function create
             * @memberof frameplayer.protobuf.Pixel
             * @static
             * @param {frameplayer.protobuf.IPixel=} [properties] Properties to set
             * @returns {frameplayer.protobuf.Pixel} Pixel instance
             */
            Pixel.create = function create(properties) {
                return new Pixel(properties);
            };

            /**
             * Encodes the specified Pixel message. Does not implicitly {@link frameplayer.protobuf.Pixel.verify|verify} messages.
             * @function encode
             * @memberof frameplayer.protobuf.Pixel
             * @static
             * @param {frameplayer.protobuf.IPixel} message Pixel message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Pixel.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.r != null && message.hasOwnProperty("r"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.r);
                if (message.g != null && message.hasOwnProperty("g"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int32(message.g);
                if (message.b != null && message.hasOwnProperty("b"))
                    writer.uint32(/* id 3, wireType 0 =*/24).int32(message.b);
                return writer;
            };

            /**
             * Encodes the specified Pixel message, length delimited. Does not implicitly {@link frameplayer.protobuf.Pixel.verify|verify} messages.
             * @function encodeDelimited
             * @memberof frameplayer.protobuf.Pixel
             * @static
             * @param {frameplayer.protobuf.IPixel} message Pixel message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Pixel.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Pixel message from the specified reader or buffer.
             * @function decode
             * @memberof frameplayer.protobuf.Pixel
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {frameplayer.protobuf.Pixel} Pixel
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Pixel.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.frameplayer.protobuf.Pixel();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.r = reader.int32();
                        break;
                    case 2:
                        message.g = reader.int32();
                        break;
                    case 3:
                        message.b = reader.int32();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Pixel message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof frameplayer.protobuf.Pixel
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {frameplayer.protobuf.Pixel} Pixel
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Pixel.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Pixel message.
             * @function verify
             * @memberof frameplayer.protobuf.Pixel
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Pixel.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.r != null && message.hasOwnProperty("r"))
                    if (!$util.isInteger(message.r))
                        return "r: integer expected";
                if (message.g != null && message.hasOwnProperty("g"))
                    if (!$util.isInteger(message.g))
                        return "g: integer expected";
                if (message.b != null && message.hasOwnProperty("b"))
                    if (!$util.isInteger(message.b))
                        return "b: integer expected";
                return null;
            };

            /**
             * Creates a Pixel message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof frameplayer.protobuf.Pixel
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {frameplayer.protobuf.Pixel} Pixel
             */
            Pixel.fromObject = function fromObject(object) {
                if (object instanceof $root.frameplayer.protobuf.Pixel)
                    return object;
                let message = new $root.frameplayer.protobuf.Pixel();
                if (object.r != null)
                    message.r = object.r | 0;
                if (object.g != null)
                    message.g = object.g | 0;
                if (object.b != null)
                    message.b = object.b | 0;
                return message;
            };

            /**
             * Creates a plain object from a Pixel message. Also converts values to other types if specified.
             * @function toObject
             * @memberof frameplayer.protobuf.Pixel
             * @static
             * @param {frameplayer.protobuf.Pixel} message Pixel
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Pixel.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.r = 0;
                    object.g = 0;
                    object.b = 0;
                }
                if (message.r != null && message.hasOwnProperty("r"))
                    object.r = message.r;
                if (message.g != null && message.hasOwnProperty("g"))
                    object.g = message.g;
                if (message.b != null && message.hasOwnProperty("b"))
                    object.b = message.b;
                return object;
            };

            /**
             * Converts this Pixel to JSON.
             * @function toJSON
             * @memberof frameplayer.protobuf.Pixel
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Pixel.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Pixel;
        })();

        protobuf.Frame = (function() {

            /**
             * Properties of a Frame.
             * @memberof frameplayer.protobuf
             * @interface IFrame
             * @property {Array.<frameplayer.protobuf.IPixel>|null} [pixels] Frame pixels
             */

            /**
             * Constructs a new Frame.
             * @memberof frameplayer.protobuf
             * @classdesc Represents a Frame.
             * @implements IFrame
             * @constructor
             * @param {frameplayer.protobuf.IFrame=} [properties] Properties to set
             */
            function Frame(properties) {
                this.pixels = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Frame pixels.
             * @member {Array.<frameplayer.protobuf.IPixel>} pixels
             * @memberof frameplayer.protobuf.Frame
             * @instance
             */
            Frame.prototype.pixels = $util.emptyArray;

            /**
             * Creates a new Frame instance using the specified properties.
             * @function create
             * @memberof frameplayer.protobuf.Frame
             * @static
             * @param {frameplayer.protobuf.IFrame=} [properties] Properties to set
             * @returns {frameplayer.protobuf.Frame} Frame instance
             */
            Frame.create = function create(properties) {
                return new Frame(properties);
            };

            /**
             * Encodes the specified Frame message. Does not implicitly {@link frameplayer.protobuf.Frame.verify|verify} messages.
             * @function encode
             * @memberof frameplayer.protobuf.Frame
             * @static
             * @param {frameplayer.protobuf.IFrame} message Frame message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Frame.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.pixels != null && message.pixels.length)
                    for (let i = 0; i < message.pixels.length; ++i)
                        $root.frameplayer.protobuf.Pixel.encode(message.pixels[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified Frame message, length delimited. Does not implicitly {@link frameplayer.protobuf.Frame.verify|verify} messages.
             * @function encodeDelimited
             * @memberof frameplayer.protobuf.Frame
             * @static
             * @param {frameplayer.protobuf.IFrame} message Frame message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Frame.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Frame message from the specified reader or buffer.
             * @function decode
             * @memberof frameplayer.protobuf.Frame
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {frameplayer.protobuf.Frame} Frame
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Frame.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.frameplayer.protobuf.Frame();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        if (!(message.pixels && message.pixels.length))
                            message.pixels = [];
                        message.pixels.push($root.frameplayer.protobuf.Pixel.decode(reader, reader.uint32()));
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Frame message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof frameplayer.protobuf.Frame
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {frameplayer.protobuf.Frame} Frame
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Frame.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Frame message.
             * @function verify
             * @memberof frameplayer.protobuf.Frame
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Frame.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.pixels != null && message.hasOwnProperty("pixels")) {
                    if (!Array.isArray(message.pixels))
                        return "pixels: array expected";
                    for (let i = 0; i < message.pixels.length; ++i) {
                        let error = $root.frameplayer.protobuf.Pixel.verify(message.pixels[i]);
                        if (error)
                            return "pixels." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a Frame message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof frameplayer.protobuf.Frame
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {frameplayer.protobuf.Frame} Frame
             */
            Frame.fromObject = function fromObject(object) {
                if (object instanceof $root.frameplayer.protobuf.Frame)
                    return object;
                let message = new $root.frameplayer.protobuf.Frame();
                if (object.pixels) {
                    if (!Array.isArray(object.pixels))
                        throw TypeError(".frameplayer.protobuf.Frame.pixels: array expected");
                    message.pixels = [];
                    for (let i = 0; i < object.pixels.length; ++i) {
                        if (typeof object.pixels[i] !== "object")
                            throw TypeError(".frameplayer.protobuf.Frame.pixels: object expected");
                        message.pixels[i] = $root.frameplayer.protobuf.Pixel.fromObject(object.pixels[i]);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from a Frame message. Also converts values to other types if specified.
             * @function toObject
             * @memberof frameplayer.protobuf.Frame
             * @static
             * @param {frameplayer.protobuf.Frame} message Frame
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Frame.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults)
                    object.pixels = [];
                if (message.pixels && message.pixels.length) {
                    object.pixels = [];
                    for (let j = 0; j < message.pixels.length; ++j)
                        object.pixels[j] = $root.frameplayer.protobuf.Pixel.toObject(message.pixels[j], options);
                }
                return object;
            };

            /**
             * Converts this Frame to JSON.
             * @function toJSON
             * @memberof frameplayer.protobuf.Frame
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Frame.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Frame;
        })();

        protobuf.Channel = (function() {

            /**
             * Properties of a Channel.
             * @memberof frameplayer.protobuf
             * @interface IChannel
             * @property {Array.<frameplayer.protobuf.IFrame>|null} [frames] Channel frames
             */

            /**
             * Constructs a new Channel.
             * @memberof frameplayer.protobuf
             * @classdesc Represents a Channel.
             * @implements IChannel
             * @constructor
             * @param {frameplayer.protobuf.IChannel=} [properties] Properties to set
             */
            function Channel(properties) {
                this.frames = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Channel frames.
             * @member {Array.<frameplayer.protobuf.IFrame>} frames
             * @memberof frameplayer.protobuf.Channel
             * @instance
             */
            Channel.prototype.frames = $util.emptyArray;

            /**
             * Creates a new Channel instance using the specified properties.
             * @function create
             * @memberof frameplayer.protobuf.Channel
             * @static
             * @param {frameplayer.protobuf.IChannel=} [properties] Properties to set
             * @returns {frameplayer.protobuf.Channel} Channel instance
             */
            Channel.create = function create(properties) {
                return new Channel(properties);
            };

            /**
             * Encodes the specified Channel message. Does not implicitly {@link frameplayer.protobuf.Channel.verify|verify} messages.
             * @function encode
             * @memberof frameplayer.protobuf.Channel
             * @static
             * @param {frameplayer.protobuf.IChannel} message Channel message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Channel.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.frames != null && message.frames.length)
                    for (let i = 0; i < message.frames.length; ++i)
                        $root.frameplayer.protobuf.Frame.encode(message.frames[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified Channel message, length delimited. Does not implicitly {@link frameplayer.protobuf.Channel.verify|verify} messages.
             * @function encodeDelimited
             * @memberof frameplayer.protobuf.Channel
             * @static
             * @param {frameplayer.protobuf.IChannel} message Channel message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Channel.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Channel message from the specified reader or buffer.
             * @function decode
             * @memberof frameplayer.protobuf.Channel
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {frameplayer.protobuf.Channel} Channel
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Channel.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.frameplayer.protobuf.Channel();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        if (!(message.frames && message.frames.length))
                            message.frames = [];
                        message.frames.push($root.frameplayer.protobuf.Frame.decode(reader, reader.uint32()));
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Channel message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof frameplayer.protobuf.Channel
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {frameplayer.protobuf.Channel} Channel
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Channel.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Channel message.
             * @function verify
             * @memberof frameplayer.protobuf.Channel
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Channel.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.frames != null && message.hasOwnProperty("frames")) {
                    if (!Array.isArray(message.frames))
                        return "frames: array expected";
                    for (let i = 0; i < message.frames.length; ++i) {
                        let error = $root.frameplayer.protobuf.Frame.verify(message.frames[i]);
                        if (error)
                            return "frames." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a Channel message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof frameplayer.protobuf.Channel
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {frameplayer.protobuf.Channel} Channel
             */
            Channel.fromObject = function fromObject(object) {
                if (object instanceof $root.frameplayer.protobuf.Channel)
                    return object;
                let message = new $root.frameplayer.protobuf.Channel();
                if (object.frames) {
                    if (!Array.isArray(object.frames))
                        throw TypeError(".frameplayer.protobuf.Channel.frames: array expected");
                    message.frames = [];
                    for (let i = 0; i < object.frames.length; ++i) {
                        if (typeof object.frames[i] !== "object")
                            throw TypeError(".frameplayer.protobuf.Channel.frames: object expected");
                        message.frames[i] = $root.frameplayer.protobuf.Frame.fromObject(object.frames[i]);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from a Channel message. Also converts values to other types if specified.
             * @function toObject
             * @memberof frameplayer.protobuf.Channel
             * @static
             * @param {frameplayer.protobuf.Channel} message Channel
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Channel.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults)
                    object.frames = [];
                if (message.frames && message.frames.length) {
                    object.frames = [];
                    for (let j = 0; j < message.frames.length; ++j)
                        object.frames[j] = $root.frameplayer.protobuf.Frame.toObject(message.frames[j], options);
                }
                return object;
            };

            /**
             * Converts this Channel to JSON.
             * @function toJSON
             * @memberof frameplayer.protobuf.Channel
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Channel.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Channel;
        })();

        protobuf.Animation = (function() {

            /**
             * Properties of an Animation.
             * @memberof frameplayer.protobuf
             * @interface IAnimation
             * @property {number|null} [fps] Animation fps
             * @property {Object.<string,frameplayer.protobuf.IChannel>|null} [channels] Animation channels
             */

            /**
             * Constructs a new Animation.
             * @memberof frameplayer.protobuf
             * @classdesc A multi-channel animation, consisting of a series of frames for
             * each channel.
             * @implements IAnimation
             * @constructor
             * @param {frameplayer.protobuf.IAnimation=} [properties] Properties to set
             */
            function Animation(properties) {
                this.channels = {};
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Animation fps.
             * @member {number} fps
             * @memberof frameplayer.protobuf.Animation
             * @instance
             */
            Animation.prototype.fps = 0;

            /**
             * Animation channels.
             * @member {Object.<string,frameplayer.protobuf.IChannel>} channels
             * @memberof frameplayer.protobuf.Animation
             * @instance
             */
            Animation.prototype.channels = $util.emptyObject;

            /**
             * Creates a new Animation instance using the specified properties.
             * @function create
             * @memberof frameplayer.protobuf.Animation
             * @static
             * @param {frameplayer.protobuf.IAnimation=} [properties] Properties to set
             * @returns {frameplayer.protobuf.Animation} Animation instance
             */
            Animation.create = function create(properties) {
                return new Animation(properties);
            };

            /**
             * Encodes the specified Animation message. Does not implicitly {@link frameplayer.protobuf.Animation.verify|verify} messages.
             * @function encode
             * @memberof frameplayer.protobuf.Animation
             * @static
             * @param {frameplayer.protobuf.IAnimation} message Animation message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Animation.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.fps != null && message.hasOwnProperty("fps"))
                    writer.uint32(/* id 1, wireType 5 =*/13).float(message.fps);
                if (message.channels != null && message.hasOwnProperty("channels"))
                    for (let keys = Object.keys(message.channels), i = 0; i < keys.length; ++i) {
                        writer.uint32(/* id 2, wireType 2 =*/18).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                        $root.frameplayer.protobuf.Channel.encode(message.channels[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                    }
                return writer;
            };

            /**
             * Encodes the specified Animation message, length delimited. Does not implicitly {@link frameplayer.protobuf.Animation.verify|verify} messages.
             * @function encodeDelimited
             * @memberof frameplayer.protobuf.Animation
             * @static
             * @param {frameplayer.protobuf.IAnimation} message Animation message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Animation.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an Animation message from the specified reader or buffer.
             * @function decode
             * @memberof frameplayer.protobuf.Animation
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {frameplayer.protobuf.Animation} Animation
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Animation.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.frameplayer.protobuf.Animation(), key;
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.fps = reader.float();
                        break;
                    case 2:
                        reader.skip().pos++;
                        if (message.channels === $util.emptyObject)
                            message.channels = {};
                        key = reader.string();
                        reader.pos++;
                        message.channels[key] = $root.frameplayer.protobuf.Channel.decode(reader, reader.uint32());
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an Animation message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof frameplayer.protobuf.Animation
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {frameplayer.protobuf.Animation} Animation
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Animation.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an Animation message.
             * @function verify
             * @memberof frameplayer.protobuf.Animation
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Animation.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.fps != null && message.hasOwnProperty("fps"))
                    if (typeof message.fps !== "number")
                        return "fps: number expected";
                if (message.channels != null && message.hasOwnProperty("channels")) {
                    if (!$util.isObject(message.channels))
                        return "channels: object expected";
                    let key = Object.keys(message.channels);
                    for (let i = 0; i < key.length; ++i) {
                        let error = $root.frameplayer.protobuf.Channel.verify(message.channels[key[i]]);
                        if (error)
                            return "channels." + error;
                    }
                }
                return null;
            };

            /**
             * Creates an Animation message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof frameplayer.protobuf.Animation
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {frameplayer.protobuf.Animation} Animation
             */
            Animation.fromObject = function fromObject(object) {
                if (object instanceof $root.frameplayer.protobuf.Animation)
                    return object;
                let message = new $root.frameplayer.protobuf.Animation();
                if (object.fps != null)
                    message.fps = Number(object.fps);
                if (object.channels) {
                    if (typeof object.channels !== "object")
                        throw TypeError(".frameplayer.protobuf.Animation.channels: object expected");
                    message.channels = {};
                    for (let keys = Object.keys(object.channels), i = 0; i < keys.length; ++i) {
                        if (typeof object.channels[keys[i]] !== "object")
                            throw TypeError(".frameplayer.protobuf.Animation.channels: object expected");
                        message.channels[keys[i]] = $root.frameplayer.protobuf.Channel.fromObject(object.channels[keys[i]]);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from an Animation message. Also converts values to other types if specified.
             * @function toObject
             * @memberof frameplayer.protobuf.Animation
             * @static
             * @param {frameplayer.protobuf.Animation} message Animation
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Animation.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.objects || options.defaults)
                    object.channels = {};
                if (options.defaults)
                    object.fps = 0;
                if (message.fps != null && message.hasOwnProperty("fps"))
                    object.fps = options.json && !isFinite(message.fps) ? String(message.fps) : message.fps;
                let keys2;
                if (message.channels && (keys2 = Object.keys(message.channels)).length) {
                    object.channels = {};
                    for (let j = 0; j < keys2.length; ++j)
                        object.channels[keys2[j]] = $root.frameplayer.protobuf.Channel.toObject(message.channels[keys2[j]], options);
                }
                return object;
            };

            /**
             * Converts this Animation to JSON.
             * @function toJSON
             * @memberof frameplayer.protobuf.Animation
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Animation.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Animation;
        })();

        protobuf.FrameplayerBuffer = (function() {

            /**
             * Properties of a FrameplayerBuffer.
             * @memberof frameplayer.protobuf
             * @interface IFrameplayerBuffer
             * @property {number|null} [magic] Magic number defined in the application, used to sanity check
             * buffer contents.
             * @property {frameplayer.protobuf.IAnimation|null} [animation] Actual animation contents.
             */

            /**
             * Constructs a new FrameplayerBuffer.
             * @memberof frameplayer.protobuf
             * @classdesc Defines a binary file format parsed by the library to play
             * animations. Video files are converted to this format via `prepare`
             * in the CLI.
             * @implements IFrameplayerBuffer
             * @constructor
             * @param {frameplayer.protobuf.IFrameplayerBuffer=} [properties] Properties to set
             */
            function FrameplayerBuffer(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Magic number defined in the application, used to sanity check
             * buffer contents.
             * @member {number} magic
             * @memberof frameplayer.protobuf.FrameplayerBuffer
             * @instance
             */
            FrameplayerBuffer.prototype.magic = 0;

            /**
             * Actual animation contents.
             * @member {frameplayer.protobuf.IAnimation|null|undefined} animation
             * @memberof frameplayer.protobuf.FrameplayerBuffer
             * @instance
             */
            FrameplayerBuffer.prototype.animation = null;

            /**
             * Creates a new FrameplayerBuffer instance using the specified properties.
             * @function create
             * @memberof frameplayer.protobuf.FrameplayerBuffer
             * @static
             * @param {frameplayer.protobuf.IFrameplayerBuffer=} [properties] Properties to set
             * @returns {frameplayer.protobuf.FrameplayerBuffer} FrameplayerBuffer instance
             */
            FrameplayerBuffer.create = function create(properties) {
                return new FrameplayerBuffer(properties);
            };

            /**
             * Encodes the specified FrameplayerBuffer message. Does not implicitly {@link frameplayer.protobuf.FrameplayerBuffer.verify|verify} messages.
             * @function encode
             * @memberof frameplayer.protobuf.FrameplayerBuffer
             * @static
             * @param {frameplayer.protobuf.IFrameplayerBuffer} message FrameplayerBuffer message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            FrameplayerBuffer.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.magic != null && message.hasOwnProperty("magic"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.magic);
                if (message.animation != null && message.hasOwnProperty("animation"))
                    $root.frameplayer.protobuf.Animation.encode(message.animation, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified FrameplayerBuffer message, length delimited. Does not implicitly {@link frameplayer.protobuf.FrameplayerBuffer.verify|verify} messages.
             * @function encodeDelimited
             * @memberof frameplayer.protobuf.FrameplayerBuffer
             * @static
             * @param {frameplayer.protobuf.IFrameplayerBuffer} message FrameplayerBuffer message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            FrameplayerBuffer.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a FrameplayerBuffer message from the specified reader or buffer.
             * @function decode
             * @memberof frameplayer.protobuf.FrameplayerBuffer
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {frameplayer.protobuf.FrameplayerBuffer} FrameplayerBuffer
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            FrameplayerBuffer.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.frameplayer.protobuf.FrameplayerBuffer();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.magic = reader.int32();
                        break;
                    case 2:
                        message.animation = $root.frameplayer.protobuf.Animation.decode(reader, reader.uint32());
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a FrameplayerBuffer message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof frameplayer.protobuf.FrameplayerBuffer
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {frameplayer.protobuf.FrameplayerBuffer} FrameplayerBuffer
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            FrameplayerBuffer.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a FrameplayerBuffer message.
             * @function verify
             * @memberof frameplayer.protobuf.FrameplayerBuffer
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            FrameplayerBuffer.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.magic != null && message.hasOwnProperty("magic"))
                    if (!$util.isInteger(message.magic))
                        return "magic: integer expected";
                if (message.animation != null && message.hasOwnProperty("animation")) {
                    let error = $root.frameplayer.protobuf.Animation.verify(message.animation);
                    if (error)
                        return "animation." + error;
                }
                return null;
            };

            /**
             * Creates a FrameplayerBuffer message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof frameplayer.protobuf.FrameplayerBuffer
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {frameplayer.protobuf.FrameplayerBuffer} FrameplayerBuffer
             */
            FrameplayerBuffer.fromObject = function fromObject(object) {
                if (object instanceof $root.frameplayer.protobuf.FrameplayerBuffer)
                    return object;
                let message = new $root.frameplayer.protobuf.FrameplayerBuffer();
                if (object.magic != null)
                    message.magic = object.magic | 0;
                if (object.animation != null) {
                    if (typeof object.animation !== "object")
                        throw TypeError(".frameplayer.protobuf.FrameplayerBuffer.animation: object expected");
                    message.animation = $root.frameplayer.protobuf.Animation.fromObject(object.animation);
                }
                return message;
            };

            /**
             * Creates a plain object from a FrameplayerBuffer message. Also converts values to other types if specified.
             * @function toObject
             * @memberof frameplayer.protobuf.FrameplayerBuffer
             * @static
             * @param {frameplayer.protobuf.FrameplayerBuffer} message FrameplayerBuffer
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            FrameplayerBuffer.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.magic = 0;
                    object.animation = null;
                }
                if (message.magic != null && message.hasOwnProperty("magic"))
                    object.magic = message.magic;
                if (message.animation != null && message.hasOwnProperty("animation"))
                    object.animation = $root.frameplayer.protobuf.Animation.toObject(message.animation, options);
                return object;
            };

            /**
             * Converts this FrameplayerBuffer to JSON.
             * @function toJSON
             * @memberof frameplayer.protobuf.FrameplayerBuffer
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            FrameplayerBuffer.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return FrameplayerBuffer;
        })();

        return protobuf;
    })();

    return frameplayer;
})();

export { $root as default };
