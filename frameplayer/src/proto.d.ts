import * as $protobuf from "protobufjs";
/** Namespace frameplayer. */
export namespace frameplayer {

    /** Namespace protobuf. */
    namespace protobuf {

        /** Properties of a Pixel. */
        interface IPixel {

            /** Pixel r */
            r?: (number|null);

            /** Pixel g */
            g?: (number|null);

            /** Pixel b */
            b?: (number|null);
        }

        /** Represents a Pixel. */
        class Pixel implements IPixel {

            /**
             * Constructs a new Pixel.
             * @param [properties] Properties to set
             */
            constructor(properties?: frameplayer.protobuf.IPixel);

            /** Pixel r. */
            public r: number;

            /** Pixel g. */
            public g: number;

            /** Pixel b. */
            public b: number;

            /**
             * Creates a new Pixel instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Pixel instance
             */
            public static create(properties?: frameplayer.protobuf.IPixel): frameplayer.protobuf.Pixel;

            /**
             * Encodes the specified Pixel message. Does not implicitly {@link frameplayer.protobuf.Pixel.verify|verify} messages.
             * @param message Pixel message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: frameplayer.protobuf.IPixel, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Pixel message, length delimited. Does not implicitly {@link frameplayer.protobuf.Pixel.verify|verify} messages.
             * @param message Pixel message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: frameplayer.protobuf.IPixel, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Pixel message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Pixel
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): frameplayer.protobuf.Pixel;

            /**
             * Decodes a Pixel message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Pixel
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): frameplayer.protobuf.Pixel;

            /**
             * Verifies a Pixel message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Pixel message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Pixel
             */
            public static fromObject(object: { [k: string]: any }): frameplayer.protobuf.Pixel;

            /**
             * Creates a plain object from a Pixel message. Also converts values to other types if specified.
             * @param message Pixel
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: frameplayer.protobuf.Pixel, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Pixel to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a Frame. */
        interface IFrame {

            /** Frame pixels */
            pixels?: (frameplayer.protobuf.IPixel[]|null);
        }

        /** Represents a Frame. */
        class Frame implements IFrame {

            /**
             * Constructs a new Frame.
             * @param [properties] Properties to set
             */
            constructor(properties?: frameplayer.protobuf.IFrame);

            /** Frame pixels. */
            public pixels: frameplayer.protobuf.IPixel[];

            /**
             * Creates a new Frame instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Frame instance
             */
            public static create(properties?: frameplayer.protobuf.IFrame): frameplayer.protobuf.Frame;

            /**
             * Encodes the specified Frame message. Does not implicitly {@link frameplayer.protobuf.Frame.verify|verify} messages.
             * @param message Frame message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: frameplayer.protobuf.IFrame, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Frame message, length delimited. Does not implicitly {@link frameplayer.protobuf.Frame.verify|verify} messages.
             * @param message Frame message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: frameplayer.protobuf.IFrame, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Frame message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Frame
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): frameplayer.protobuf.Frame;

            /**
             * Decodes a Frame message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Frame
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): frameplayer.protobuf.Frame;

            /**
             * Verifies a Frame message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Frame message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Frame
             */
            public static fromObject(object: { [k: string]: any }): frameplayer.protobuf.Frame;

            /**
             * Creates a plain object from a Frame message. Also converts values to other types if specified.
             * @param message Frame
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: frameplayer.protobuf.Frame, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Frame to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a Channel. */
        interface IChannel {

            /** Channel frames */
            frames?: (frameplayer.protobuf.IFrame[]|null);
        }

        /** Represents a Channel. */
        class Channel implements IChannel {

            /**
             * Constructs a new Channel.
             * @param [properties] Properties to set
             */
            constructor(properties?: frameplayer.protobuf.IChannel);

            /** Channel frames. */
            public frames: frameplayer.protobuf.IFrame[];

            /**
             * Creates a new Channel instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Channel instance
             */
            public static create(properties?: frameplayer.protobuf.IChannel): frameplayer.protobuf.Channel;

            /**
             * Encodes the specified Channel message. Does not implicitly {@link frameplayer.protobuf.Channel.verify|verify} messages.
             * @param message Channel message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: frameplayer.protobuf.IChannel, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Channel message, length delimited. Does not implicitly {@link frameplayer.protobuf.Channel.verify|verify} messages.
             * @param message Channel message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: frameplayer.protobuf.IChannel, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Channel message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Channel
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): frameplayer.protobuf.Channel;

            /**
             * Decodes a Channel message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Channel
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): frameplayer.protobuf.Channel;

            /**
             * Verifies a Channel message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Channel message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Channel
             */
            public static fromObject(object: { [k: string]: any }): frameplayer.protobuf.Channel;

            /**
             * Creates a plain object from a Channel message. Also converts values to other types if specified.
             * @param message Channel
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: frameplayer.protobuf.Channel, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Channel to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of an Animation. */
        interface IAnimation {

            /** Animation fps */
            fps?: (number|null);

            /** Animation channels */
            channels?: ({ [k: string]: frameplayer.protobuf.IChannel }|null);
        }

        /**
         * A multi-channel animation, consisting of a series of frames for
         * each channel.
         */
        class Animation implements IAnimation {

            /**
             * Constructs a new Animation.
             * @param [properties] Properties to set
             */
            constructor(properties?: frameplayer.protobuf.IAnimation);

            /** Animation fps. */
            public fps: number;

            /** Animation channels. */
            public channels: { [k: string]: frameplayer.protobuf.IChannel };

            /**
             * Creates a new Animation instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Animation instance
             */
            public static create(properties?: frameplayer.protobuf.IAnimation): frameplayer.protobuf.Animation;

            /**
             * Encodes the specified Animation message. Does not implicitly {@link frameplayer.protobuf.Animation.verify|verify} messages.
             * @param message Animation message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: frameplayer.protobuf.IAnimation, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Animation message, length delimited. Does not implicitly {@link frameplayer.protobuf.Animation.verify|verify} messages.
             * @param message Animation message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: frameplayer.protobuf.IAnimation, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Animation message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Animation
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): frameplayer.protobuf.Animation;

            /**
             * Decodes an Animation message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Animation
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): frameplayer.protobuf.Animation;

            /**
             * Verifies an Animation message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Animation message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Animation
             */
            public static fromObject(object: { [k: string]: any }): frameplayer.protobuf.Animation;

            /**
             * Creates a plain object from an Animation message. Also converts values to other types if specified.
             * @param message Animation
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: frameplayer.protobuf.Animation, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Animation to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a FrameplayerBuffer. */
        interface IFrameplayerBuffer {

            /**
             * Magic number defined in the application, used to sanity check
             * buffer contents.
             */
            magic?: (number|null);

            /** Actual animation contents. */
            animation?: (frameplayer.protobuf.IAnimation|null);
        }

        /**
         * Defines a binary file format parsed by the library to play
         * animations. Video files are converted to this format via `prepare`
         * in the CLI.
         */
        class FrameplayerBuffer implements IFrameplayerBuffer {

            /**
             * Constructs a new FrameplayerBuffer.
             * @param [properties] Properties to set
             */
            constructor(properties?: frameplayer.protobuf.IFrameplayerBuffer);

            /**
             * Magic number defined in the application, used to sanity check
             * buffer contents.
             */
            public magic: number;

            /** Actual animation contents. */
            public animation?: (frameplayer.protobuf.IAnimation|null);

            /**
             * Creates a new FrameplayerBuffer instance using the specified properties.
             * @param [properties] Properties to set
             * @returns FrameplayerBuffer instance
             */
            public static create(properties?: frameplayer.protobuf.IFrameplayerBuffer): frameplayer.protobuf.FrameplayerBuffer;

            /**
             * Encodes the specified FrameplayerBuffer message. Does not implicitly {@link frameplayer.protobuf.FrameplayerBuffer.verify|verify} messages.
             * @param message FrameplayerBuffer message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: frameplayer.protobuf.IFrameplayerBuffer, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified FrameplayerBuffer message, length delimited. Does not implicitly {@link frameplayer.protobuf.FrameplayerBuffer.verify|verify} messages.
             * @param message FrameplayerBuffer message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: frameplayer.protobuf.IFrameplayerBuffer, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a FrameplayerBuffer message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns FrameplayerBuffer
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): frameplayer.protobuf.FrameplayerBuffer;

            /**
             * Decodes a FrameplayerBuffer message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns FrameplayerBuffer
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): frameplayer.protobuf.FrameplayerBuffer;

            /**
             * Verifies a FrameplayerBuffer message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a FrameplayerBuffer message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns FrameplayerBuffer
             */
            public static fromObject(object: { [k: string]: any }): frameplayer.protobuf.FrameplayerBuffer;

            /**
             * Creates a plain object from a FrameplayerBuffer message. Also converts values to other types if specified.
             * @param message FrameplayerBuffer
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: frameplayer.protobuf.FrameplayerBuffer, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this FrameplayerBuffer to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }
}
