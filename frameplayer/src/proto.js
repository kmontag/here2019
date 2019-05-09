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

        protobuf.Frames = (function() {

            /**
             * Properties of a Frames.
             * @memberof frameplayer.protobuf
             * @interface IFrames
             * @property {Array.<frameplayer.protobuf.IFrame>|null} [frames] Frames frames
             */

            /**
             * Constructs a new Frames.
             * @memberof frameplayer.protobuf
             * @classdesc Represents a Frames.
             * @implements IFrames
             * @constructor
             * @param {frameplayer.protobuf.IFrames=} [properties] Properties to set
             */
            function Frames(properties) {
                this.frames = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Frames frames.
             * @member {Array.<frameplayer.protobuf.IFrame>} frames
             * @memberof frameplayer.protobuf.Frames
             * @instance
             */
            Frames.prototype.frames = $util.emptyArray;

            /**
             * Creates a new Frames instance using the specified properties.
             * @function create
             * @memberof frameplayer.protobuf.Frames
             * @static
             * @param {frameplayer.protobuf.IFrames=} [properties] Properties to set
             * @returns {frameplayer.protobuf.Frames} Frames instance
             */
            Frames.create = function create(properties) {
                return new Frames(properties);
            };

            /**
             * Encodes the specified Frames message. Does not implicitly {@link frameplayer.protobuf.Frames.verify|verify} messages.
             * @function encode
             * @memberof frameplayer.protobuf.Frames
             * @static
             * @param {frameplayer.protobuf.IFrames} message Frames message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Frames.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.frames != null && message.frames.length)
                    for (let i = 0; i < message.frames.length; ++i)
                        $root.frameplayer.protobuf.Frame.encode(message.frames[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified Frames message, length delimited. Does not implicitly {@link frameplayer.protobuf.Frames.verify|verify} messages.
             * @function encodeDelimited
             * @memberof frameplayer.protobuf.Frames
             * @static
             * @param {frameplayer.protobuf.IFrames} message Frames message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Frames.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Frames message from the specified reader or buffer.
             * @function decode
             * @memberof frameplayer.protobuf.Frames
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {frameplayer.protobuf.Frames} Frames
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Frames.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.frameplayer.protobuf.Frames();
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
             * Decodes a Frames message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof frameplayer.protobuf.Frames
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {frameplayer.protobuf.Frames} Frames
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Frames.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Frames message.
             * @function verify
             * @memberof frameplayer.protobuf.Frames
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Frames.verify = function verify(message) {
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
             * Creates a Frames message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof frameplayer.protobuf.Frames
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {frameplayer.protobuf.Frames} Frames
             */
            Frames.fromObject = function fromObject(object) {
                if (object instanceof $root.frameplayer.protobuf.Frames)
                    return object;
                let message = new $root.frameplayer.protobuf.Frames();
                if (object.frames) {
                    if (!Array.isArray(object.frames))
                        throw TypeError(".frameplayer.protobuf.Frames.frames: array expected");
                    message.frames = [];
                    for (let i = 0; i < object.frames.length; ++i) {
                        if (typeof object.frames[i] !== "object")
                            throw TypeError(".frameplayer.protobuf.Frames.frames: object expected");
                        message.frames[i] = $root.frameplayer.protobuf.Frame.fromObject(object.frames[i]);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from a Frames message. Also converts values to other types if specified.
             * @function toObject
             * @memberof frameplayer.protobuf.Frames
             * @static
             * @param {frameplayer.protobuf.Frames} message Frames
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Frames.toObject = function toObject(message, options) {
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
             * Converts this Frames to JSON.
             * @function toJSON
             * @memberof frameplayer.protobuf.Frames
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Frames.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Frames;
        })();

        protobuf.Animation = (function() {

            /**
             * Properties of an Animation.
             * @memberof frameplayer.protobuf
             * @interface IAnimation
             * @property {number|null} [fps] Animation fps
             * @property {Object.<string,frameplayer.protobuf.IFrames>|null} [framesByChannel] Animation framesByChannel
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
                this.framesByChannel = {};
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
             * Animation framesByChannel.
             * @member {Object.<string,frameplayer.protobuf.IFrames>} framesByChannel
             * @memberof frameplayer.protobuf.Animation
             * @instance
             */
            Animation.prototype.framesByChannel = $util.emptyObject;

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
                if (message.framesByChannel != null && message.hasOwnProperty("framesByChannel"))
                    for (let keys = Object.keys(message.framesByChannel), i = 0; i < keys.length; ++i) {
                        writer.uint32(/* id 2, wireType 2 =*/18).fork().uint32(/* id 1, wireType 0 =*/8).uint32(keys[i]);
                        $root.frameplayer.protobuf.Frames.encode(message.framesByChannel[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
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
                        if (message.framesByChannel === $util.emptyObject)
                            message.framesByChannel = {};
                        key = reader.uint32();
                        reader.pos++;
                        message.framesByChannel[key] = $root.frameplayer.protobuf.Frames.decode(reader, reader.uint32());
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
                if (message.framesByChannel != null && message.hasOwnProperty("framesByChannel")) {
                    if (!$util.isObject(message.framesByChannel))
                        return "framesByChannel: object expected";
                    let key = Object.keys(message.framesByChannel);
                    for (let i = 0; i < key.length; ++i) {
                        if (!$util.key32Re.test(key[i]))
                            return "framesByChannel: integer key{k:uint32} expected";
                        {
                            let error = $root.frameplayer.protobuf.Frames.verify(message.framesByChannel[key[i]]);
                            if (error)
                                return "framesByChannel." + error;
                        }
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
                if (object.framesByChannel) {
                    if (typeof object.framesByChannel !== "object")
                        throw TypeError(".frameplayer.protobuf.Animation.framesByChannel: object expected");
                    message.framesByChannel = {};
                    for (let keys = Object.keys(object.framesByChannel), i = 0; i < keys.length; ++i) {
                        if (typeof object.framesByChannel[keys[i]] !== "object")
                            throw TypeError(".frameplayer.protobuf.Animation.framesByChannel: object expected");
                        message.framesByChannel[keys[i]] = $root.frameplayer.protobuf.Frames.fromObject(object.framesByChannel[keys[i]]);
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
                    object.framesByChannel = {};
                if (options.defaults)
                    object.fps = 0;
                if (message.fps != null && message.hasOwnProperty("fps"))
                    object.fps = options.json && !isFinite(message.fps) ? String(message.fps) : message.fps;
                let keys2;
                if (message.framesByChannel && (keys2 = Object.keys(message.framesByChannel)).length) {
                    object.framesByChannel = {};
                    for (let j = 0; j < keys2.length; ++j)
                        object.framesByChannel[keys2[j]] = $root.frameplayer.protobuf.Frames.toObject(message.framesByChannel[keys2[j]], options);
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

        protobuf.FrameplayerFile = (function() {

            /**
             * Properties of a FrameplayerFile.
             * @memberof frameplayer.protobuf
             * @interface IFrameplayerFile
             * @property {number|null} [magic] Magic number defined in the application, used to sanity check
             * file contents.
             * @property {frameplayer.protobuf.IAnimation|null} [animation] Actual animation contents.
             */

            /**
             * Constructs a new FrameplayerFile.
             * @memberof frameplayer.protobuf
             * @classdesc File format parsed by the library to play animations. Video files
             * are converted to this format via `prepare` in the CLI.
             * @implements IFrameplayerFile
             * @constructor
             * @param {frameplayer.protobuf.IFrameplayerFile=} [properties] Properties to set
             */
            function FrameplayerFile(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Magic number defined in the application, used to sanity check
             * file contents.
             * @member {number} magic
             * @memberof frameplayer.protobuf.FrameplayerFile
             * @instance
             */
            FrameplayerFile.prototype.magic = 0;

            /**
             * Actual animation contents.
             * @member {frameplayer.protobuf.IAnimation|null|undefined} animation
             * @memberof frameplayer.protobuf.FrameplayerFile
             * @instance
             */
            FrameplayerFile.prototype.animation = null;

            /**
             * Creates a new FrameplayerFile instance using the specified properties.
             * @function create
             * @memberof frameplayer.protobuf.FrameplayerFile
             * @static
             * @param {frameplayer.protobuf.IFrameplayerFile=} [properties] Properties to set
             * @returns {frameplayer.protobuf.FrameplayerFile} FrameplayerFile instance
             */
            FrameplayerFile.create = function create(properties) {
                return new FrameplayerFile(properties);
            };

            /**
             * Encodes the specified FrameplayerFile message. Does not implicitly {@link frameplayer.protobuf.FrameplayerFile.verify|verify} messages.
             * @function encode
             * @memberof frameplayer.protobuf.FrameplayerFile
             * @static
             * @param {frameplayer.protobuf.IFrameplayerFile} message FrameplayerFile message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            FrameplayerFile.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.magic != null && message.hasOwnProperty("magic"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.magic);
                if (message.animation != null && message.hasOwnProperty("animation"))
                    $root.frameplayer.protobuf.Animation.encode(message.animation, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified FrameplayerFile message, length delimited. Does not implicitly {@link frameplayer.protobuf.FrameplayerFile.verify|verify} messages.
             * @function encodeDelimited
             * @memberof frameplayer.protobuf.FrameplayerFile
             * @static
             * @param {frameplayer.protobuf.IFrameplayerFile} message FrameplayerFile message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            FrameplayerFile.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a FrameplayerFile message from the specified reader or buffer.
             * @function decode
             * @memberof frameplayer.protobuf.FrameplayerFile
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {frameplayer.protobuf.FrameplayerFile} FrameplayerFile
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            FrameplayerFile.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.frameplayer.protobuf.FrameplayerFile();
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
             * Decodes a FrameplayerFile message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof frameplayer.protobuf.FrameplayerFile
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {frameplayer.protobuf.FrameplayerFile} FrameplayerFile
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            FrameplayerFile.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a FrameplayerFile message.
             * @function verify
             * @memberof frameplayer.protobuf.FrameplayerFile
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            FrameplayerFile.verify = function verify(message) {
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
             * Creates a FrameplayerFile message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof frameplayer.protobuf.FrameplayerFile
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {frameplayer.protobuf.FrameplayerFile} FrameplayerFile
             */
            FrameplayerFile.fromObject = function fromObject(object) {
                if (object instanceof $root.frameplayer.protobuf.FrameplayerFile)
                    return object;
                let message = new $root.frameplayer.protobuf.FrameplayerFile();
                if (object.magic != null)
                    message.magic = object.magic | 0;
                if (object.animation != null) {
                    if (typeof object.animation !== "object")
                        throw TypeError(".frameplayer.protobuf.FrameplayerFile.animation: object expected");
                    message.animation = $root.frameplayer.protobuf.Animation.fromObject(object.animation);
                }
                return message;
            };

            /**
             * Creates a plain object from a FrameplayerFile message. Also converts values to other types if specified.
             * @function toObject
             * @memberof frameplayer.protobuf.FrameplayerFile
             * @static
             * @param {frameplayer.protobuf.FrameplayerFile} message FrameplayerFile
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            FrameplayerFile.toObject = function toObject(message, options) {
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
             * Converts this FrameplayerFile to JSON.
             * @function toJSON
             * @memberof frameplayer.protobuf.FrameplayerFile
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            FrameplayerFile.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return FrameplayerFile;
        })();

        return protobuf;
    })();

    return frameplayer;
})();

export { $root as default };
