import { encode as gptEncode } from "gpt-tokenizer";

export function encode(input: string): number[] {
  return gptEncode(input);
}

export function getTokenCount(input: string): number {
  input = input.replace(/<\|endoftext\|>/g, "");
  return encode(input).length;
}
