import { createDeliveryClient, Elements } from '@kentico/kontent-delivery';
import { isComponent, isLinkedItem, RichTextElement } from '../../../src';
import richTextItem from './complexRichTextItem.json';
import TestRenderer from 'react-test-renderer';
import { Element as DomHandlerElement } from 'domhandler';

describe('<RichTextElement/> readme code samples', () => {

    var mockClient = createDeliveryClient({
        projectId: 'dummyClient',
    });

    const response = mockClient.item("dummyItem")
        .map(richTextItem);

    it('should resolve without fail', () => {
        const testRenderer = TestRenderer.create(
            <RichTextElement
                richTextElement={response.item.elements["bio"] as Elements.RichTextElement}
                linkedItems={response.linkedItems}
                resolveLinkedItem={(linkedItem, domNode) => {
                    if (isComponent(domNode)) {
                        return (
                            <>
                                <h1>Component</h1>
                                <pre>{JSON.stringify(linkedItem, undefined, 2)}</pre>;
                            </>
                        );
                    }

                    if (isLinkedItem(domNode)) {
                        return (
                            <>
                                <h1>Linked item</h1>
                                <pre>{JSON.stringify(linkedItem, undefined, 2)}</pre>;
                            </>
                        );
                    }

                    throw new Error("Unknown type of the linked item's dom node");
                }}
                resolveImage={(image, domNode): JSX.Element => (
                    <img
                        src={image.url}
                        alt={image.description ? image.description : image.imageId}
                        width="200"
                    />
                )}
                resolveLink={(link, domNode, domToReact): JSX.Element => (
                    <a href={`/${link.type}/${link.urlSlug}`}>
                        {domToReact(domNode.children)}
                    </a>
                )}
                resolveDomNode={(domNode, domToReact) => {
                    if (domNode instanceof DomHandlerElement && domNode.name === 'table') {
                        return <div className="table-wrapper">{domToReact([domNode])}</div>;
                    }
                }}
                className="testClassName"
            />,
        );
        expect(testRenderer.toJSON()).toMatchSnapshot();
    })
});