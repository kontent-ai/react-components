/// <reference types="react" />
import { DOMNode, HTMLReactParserOptions } from "html-react-parser";
import { Elements, IContentItem, IContentItemsContainer, ILink, IRichTextImage } from '@kentico/kontent-delivery';
import { Element as DomHandlerElement } from "domhandler";
declare type ResolverLinkedItemType = (linkedItem: IContentItem | undefined, domNode: DomHandlerElement, domToReact: (nodes: DOMNode[], options?: HTMLReactParserOptions | undefined) => string | JSX.Element | JSX.Element[]) => JSX.Element | JSX.Element[] | undefined | null | false;
declare type ResolveImageType = (image: IRichTextImage, domNode: DomHandlerElement, domToReact: (nodes: DOMNode[], options?: HTMLReactParserOptions | undefined) => string | JSX.Element | JSX.Element[]) => JSX.Element | JSX.Element[] | undefined | null | false;
declare type ResolveLinkType = (link: ILink, domNode: DomHandlerElement, domToReact: (nodes: DOMNode[], options?: HTMLReactParserOptions | undefined) => string | JSX.Element | JSX.Element[]) => JSX.Element | JSX.Element[] | undefined | null | false;
declare type ResolveDomNodeType = (domNode: DOMNode, domToReact: (nodes: DOMNode[], options?: HTMLReactParserOptions | undefined) => string | JSX.Element | JSX.Element[]) => JSX.Element | JSX.Element[] | undefined | null | false;
interface IRichTextElementData {
    value: string;
    links?: ILink[];
    images?: IRichTextImage[];
    linkedItemCodenames?: string[];
}
interface IReactRichTextElementProps {
    richTextElement: IRichTextElementData | Elements.RichTextElement;
    linkedItems?: IContentItemsContainer;
    resolveLinkedItem?: ResolverLinkedItemType;
    resolveImage?: ResolveImageType;
    resolveLink?: ResolveLinkType;
    resolveDomNode?: ResolveDomNodeType;
    className?: string;
}
declare const RichTextElement: React.FC<IReactRichTextElementProps>;
export { RichTextElement };
