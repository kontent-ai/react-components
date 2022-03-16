import parseHTML, { domToReact, DOMNode, HTMLReactParserOptions } from "html-react-parser";
import { Elements, IContentItem, IContentItemsContainer, ILink, IRichTextImage } from '@kentico/kontent-delivery';
import { Element as DomHandlerElement } from "domhandler";

const IMAGE_ID_ATTRIBUTE_IDENTIFIER = "data-image-id";
const LINKED_ITEM_ID_ATTRIBUTE_IDENTIFIER = "data-item-id";

const isLinkedItem = (domNode: DOMNode): boolean => {
    if (domNode instanceof DomHandlerElement) {
        return domNode.tagName === "object" && domNode.attributes.find(attr => attr.name === "type")?.value === "application/kenticocloud";
    }
    return false;
}

const isImage = (domNode: DOMNode): boolean => {
    if (domNode instanceof DomHandlerElement) {
        return domNode.tagName === "figure" && domNode.attributes.find(attr => attr.name === IMAGE_ID_ATTRIBUTE_IDENTIFIER)?.value !== "undefined";
    }
    return false;
}

const isLinkedItemLink = (domNode: DOMNode) => {
    if (domNode instanceof DomHandlerElement) {
        return domNode.tagName === "a" && domNode.attributes.find(attr => attr.name === LINKED_ITEM_ID_ATTRIBUTE_IDENTIFIER)?.value !== "undefined";
    }
    return false;
}

// TODO encapsulate domNode and domtoReact so subtype and ideally sub-property
export type ResolverLinkedItemType = (
    linkedItem: IContentItem | undefined,
    domNode: DomHandlerElement,
    domToReact: (
        nodes: DOMNode[],
        options?: HTMLReactParserOptions | undefined
    ) => string | JSX.Element | JSX.Element[]
) => JSX.Element | JSX.Element[] | undefined | null | false

export type ResolveImageType = (
    image: IRichTextImage,
    domNode: DomHandlerElement,
    domToReact: (
        nodes: DOMNode[],
        options?: HTMLReactParserOptions | undefined
    ) => string | JSX.Element | JSX.Element[]
) => JSX.Element | JSX.Element[] | undefined | null | false

export type ResolveLinkType = (
    link: ILink,
    domNode: DomHandlerElement,
    domToReact: (
        nodes: DOMNode[],
        options?: HTMLReactParserOptions | undefined
    ) => string | JSX.Element | JSX.Element[]
) => JSX.Element | JSX.Element[] | undefined | null | false

export type ResolveDomNodeType = (
    domNode: DOMNode,
    domToReact: (
        nodes: DOMNode[],
        options?: HTMLReactParserOptions | undefined
    ) => string | JSX.Element | JSX.Element[]
) => JSX.Element | JSX.Element[] | undefined | null | false


const replaceNode = (
    domNode: DOMNode,
    richTextElement: Elements.RichTextElement,
    resolveLinkedItem?: ResolverLinkedItemType,
    resolveImage?: ResolveImageType,
    resolveLink?: ResolveLinkType,
    resolveDomNode?: ResolveDomNodeType,
): JSX.Element | object | void | undefined | null | false => {

    const { images, links } = richTextElement;
    if (resolveLinkedItem && richTextElement.linkedItems) {
        if (isLinkedItem(domNode)) {
            const node = domNode as DomHandlerElement;
            const codeName = node?.attributes.find(attr => attr.name === "data-codename")?.value;
            const linkedItem = codeName ? richTextElement.linkedItems.find(item => item.system.codename === codeName) : undefined;
            return resolveLinkedItem(linkedItem, node, domToReact);
        }
    }

    if (resolveImage && images) {
        if (isImage(domNode)) {
            const node = domNode as DomHandlerElement;
            const imageId = node?.attributes.find(attr => attr.name === IMAGE_ID_ATTRIBUTE_IDENTIFIER)?.value;
            const image = images.find((image: { imageId: string }) => image.imageId === imageId);
            if (image) {
                return resolveImage(image, node, domToReact);
            }
        }
    }

    if (resolveLink && links) {
        if (isLinkedItemLink(domNode)) {
            const node = domNode as DomHandlerElement;

            const linkId = node?.attributes.find(attr => attr.name === LINKED_ITEM_ID_ATTRIBUTE_IDENTIFIER)?.value;
            const link = links.find((link: { linkId: string }) => link.linkId === linkId);
            if (link) {
                return resolveLink(link, node, domToReact);
            }
        }
    }

    if (resolveDomNode) {
        return resolveDomNode(domNode, domToReact);
    }
}

interface IReactRichTextElementProps {
    richTextElement: Elements.RichTextElement,
    resolveLinkedItem?: ResolverLinkedItemType;
    resolveImage?: ResolveImageType;
    resolveLink?: ResolveLinkType;
    resolveDomNode?: ResolveDomNodeType;
};

const RichTextElement: React.FC<IReactRichTextElementProps> = ({
    richTextElement,
    resolveLinkedItem,
    resolveImage,
    resolveLink,
    resolveDomNode,
}) => {
    const cleanedValue = richTextElement.value.replace(/(\n|\r)+/, "");
    const result = parseHTML(cleanedValue, {
        replace: (domNode) => replaceNode(domNode, richTextElement, resolveLinkedItem, resolveImage, resolveLink, resolveDomNode),
    });

    return <>{result}</>;
}

export { RichTextElement };