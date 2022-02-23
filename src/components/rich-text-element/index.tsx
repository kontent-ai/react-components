import parseHTML, { domToReact, DOMNode, HTMLReactParserOptions } from "html-react-parser";
import { Elements, IContentItem, IContentItemsContainer, ILink, IRichTextImage } from '@kentico/kontent-delivery';

const IMAGE_ID_ATTRIBUTE_IDENTIFIER = "data-image-id";
const LINKED_ITEM_ID_ATTRIBUTE_IDENTIFIER = "data-item-id";

const isLinkedItem = (domNode: DOMNode): boolean => {
    if (domNode instanceof Element) {
        return domNode.tagName === "object" && domNode.attributes.getNamedItem("type")?.value === "application/kenticocloud";
    }
    return false;
}

const isImage = (domNode: DOMNode): boolean => {
    if (domNode instanceof Element) {
        return domNode.tagName === "figure" && domNode.attributes.getNamedItem(IMAGE_ID_ATTRIBUTE_IDENTIFIER)?.value !== "undefined";
    }
    return false;
}

const isLinkedItemLink = (domNode: DOMNode) => {
    if (domNode instanceof Element) {
        return domNode.tagName === "a" && domNode.attributes.getNamedItem(LINKED_ITEM_ID_ATTRIBUTE_IDENTIFIER)?.value !== "undefined";
    }
    return false;
}

// TODO encapsulate domNode and domtoReact so subtype and ideally sub-property
type ResolverLinkedItemType = (
    linkedItem: IContentItem | undefined,
    domNode: DOMNode,
    domToReact: (
        nodes: DOMNode[],
        options?: HTMLReactParserOptions | undefined
    ) => string | JSX.Element | JSX.Element[]
) => JSX.Element | JSX.Element[]

type ResolveImageType = (
    image: IRichTextImage | undefined,
    domNode: DOMNode,
    domToReact: (
        nodes: DOMNode[],
        options?: HTMLReactParserOptions | undefined
    ) => string | JSX.Element | JSX.Element[]
) => JSX.Element | JSX.Element[]

type ResolveLinkType = (
    link: ILink | undefined,
    domNode: DOMNode,
    domToReact: (
        nodes: DOMNode[],
        options?: HTMLReactParserOptions | undefined
    ) => string | JSX.Element | JSX.Element[]
) => JSX.Element | JSX.Element[]

type ResolveDomNodeType = (
    domNode: DOMNode,
    domToReact: (
        nodes: DOMNode[],
        options?: HTMLReactParserOptions | undefined
    ) => string | JSX.Element | JSX.Element[]
) => JSX.Element | JSX.Element[]


const replaceNode = (
    domNode: DOMNode,
    richTextElement: IRichTextElementData,
    linkedItems?: IContentItemsContainer,
    resolveLinkedItem?: ResolverLinkedItemType,
    resolveImage?: ResolveImageType,
    resolveLink?: ResolveLinkType,
    resolveDomNode?: ResolveDomNodeType,
): JSX.Element | object | void | undefined | null | false => {

    const { images, links } = richTextElement;
    if (resolveLinkedItem && linkedItems) {
        if (isLinkedItem(domNode)) {
            const node = domNode as unknown as Element;
            const codeName = node?.attributes.getNamedItem("data-codename")?.value;
            const linkedItem = codeName ? linkedItems[codeName] : undefined;
            return resolveLinkedItem(linkedItem, domNode, domToReact);
        }
    }

    if (resolveImage && images) {
        if (isImage(domNode)) {
            const node = domNode as unknown as Element;

            const imageId = node?.attributes.getNamedItem(IMAGE_ID_ATTRIBUTE_IDENTIFIER)?.value;
            const image = images.find((image: { imageId: string }) => image.imageId === imageId);
            return resolveImage(image, domNode, domToReact);
        }
    }

    if (resolveLink && links) {
        if (isLinkedItemLink(domNode)) {
            const node = domNode as unknown as Element;

            const linkId = node?.attributes.getNamedItem(LINKED_ITEM_ID_ATTRIBUTE_IDENTIFIER)?.value;
            const link = links.find((link: { linkId: string }) => link.linkId === linkId);
            return resolveLink(link, domNode, domToReact);
        }
    }

    if (resolveDomNode) {
        return resolveDomNode(domNode, domToReact);
    }
}

// TODO export?
interface IRichTextElementData {
    value: string,
    links?: ILink[];
    images?: IRichTextImage[];
    linkedItemCodenames?: string[];
};

interface IReactRichTextElementProps {
    richTextElement: IRichTextElementData | Elements.RichTextElement,
    linkedItems?: IContentItemsContainer;
    resolveLinkedItem?: ResolverLinkedItemType;
    resolveImage?: ResolveImageType;
    resolveLink?: ResolveLinkType;
    resolveDomNode?: ResolveDomNodeType;
    className?: string
};

const RichTextElement: React.FC<IReactRichTextElementProps> = ({
    richTextElement,
    linkedItems,
    resolveLinkedItem,
    resolveImage,
    resolveLink,
    resolveDomNode,
    className
}) => {
    const cleanedValue = richTextElement.value.replace(/(\n|\r)+/, "");
    const result = parseHTML(cleanedValue, {
        replace: (domNode) => replaceNode(domNode, richTextElement, linkedItems, resolveLinkedItem, resolveImage, resolveLink, resolveDomNode),
    });

    return (
        <div className={className} >
            {result}
        </div>
    );
}

export { RichTextElement };