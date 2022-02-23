import React from 'react';
import { render } from '@testing-library/react';
import TestRenderer from 'react-test-renderer';
import { createDeliveryClient, Elements } from '@kentico/kontent-delivery';
import richTextItem from './complexRichTextItem.json';
import { Element as ParserElement, domToReact } from 'html-react-parser';
import { RichTextElement } from '../../../src';
import { isComponent, isLinkedItem } from '../../../src/utils/richTextUtils';
import { Element as DomHandlerElement } from 'domhandler';

// test('Parse rich text', () => {

//   var mockClient = createDeliveryClient({
//     projectId: 'dummyClient',
//   });

//   const response = mockClient.item("dummyItem")
//     .map(richTextItem);


//   const { debug } = render(<RichTextElement
//     richTextElement={response.item.elements["bio"] as Elements.RichTextElement}
//     linkedItems={response.linkedItems}
//     resolveLinkedItem={undefined}
//     resolveImage={undefined}
//     resolveLink={undefined}
//     resolveDomNode={undefined}
//     className="testClassName"
//   />);

//   debug();
// });

describe('<RichTextElement/>', () => {

  var mockClient = createDeliveryClient({
    projectId: 'dummyClient',
  });

  const complexItemResponse = mockClient.item("dummyItem")
    .map(richTextItem);

  it('Empty rich-text value - render properly', () => {
    const testRenderer = TestRenderer.create(
      <RichTextElement richTextElement={{
        value: "<p><br></p>"
      }}
      />,
    );
    expect(testRenderer.toJSON()).toMatchSnapshot();
  });

  it('Simple rich-text value resolved simple dom node properly', () => {
    const testRenderer = TestRenderer.create(
      <RichTextElement
        richTextElement={{
          value: "<p>Lorem ipsum with <strong>bold text</strong></p>"
        }}
        resolveDomNode={(domNode, domToReact) => {
          if (domNode instanceof ParserElement) {
            if (domNode.name === "strong") {
              return <b>{domToReact(domNode.children)}</b>;
            }
          }
        }
        }
      />,
    );
    expect(testRenderer.toJSON()).toMatchSnapshot();
  });

  it('Complex rich-text value - render properly no resolution', () => {
    const testRenderer = TestRenderer.create(
      <RichTextElement richTextElement={
        complexItemResponse.item.elements["bio"] as Elements.RichTextElement
      } />,
    );
    expect(testRenderer.toJSON()).toMatchSnapshot();
  });

  it('Resolve images', () => {
    const testRenderer = TestRenderer.create(
      <RichTextElement
        richTextElement={complexItemResponse.item.elements["bio"] as Elements.RichTextElement}
        resolveImage={(image, domNode): JSX.Element => (
          <img
            src={image.url}
            alt={image.description ? image.description : image.imageId}
            width="200"
          />
        )}
      />,
    );
    expect(testRenderer.toJSON()).toMatchSnapshot();
  });

  it('Resolve links', () => {
    const complexValueRenderer = TestRenderer.create(
      <RichTextElement
        richTextElement={complexItemResponse.item.elements["bio"] as Elements.RichTextElement}
        resolveLink={(link, domNode, domToReact): JSX.Element => {
          return (
            <a href={`/${link.type}/${link.urlSlug}`}>
              {domToReact(domNode.children)}
            </a>
          );
        }}
      />,
    );
    expect(complexValueRenderer.toJSON()).toMatchSnapshot();


    const simpleValueRenderer = TestRenderer.create(
      <RichTextElement
        richTextElement={{
          value: '<p>This is the page text.</p><ul><li><a data-item-id="1abb6bf1-1e29-4deb-bb0c-b5928ffb0cc9" href="">Test link</a></li></ul>',
          links: [
            {
              urlSlug: "test-nico",
              type: "page",
              linkId: "1abb6bf1-1e29-4deb-bb0c-b5928ffb0cc9",
              codename: "test_page_nico"
            }
          ]
        }
        }

        resolveLink={(link, domNode, domToReact): JSX.Element => {
          return (
            // normally a Link component from gatsby package would be used
            <a href={`/${link.type}/${link.urlSlug}`}>
              {domToReact(domNode.children)}
            </a>
          );
        }}
      />,
    );
    expect(simpleValueRenderer.toJSON()).toMatchSnapshot();
  });

  it('Resolve linked items', () => {
    const testRenderer = TestRenderer.create(
      <RichTextElement
        richTextElement={complexItemResponse.item.elements["bio"] as Elements.RichTextElement}
        linkedItems={complexItemResponse.linkedItems}
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
      />,
    );
    expect(testRenderer.toJSON()).toMatchSnapshot();
  });

  it('Resolve geneal node - wrap table element', () => {
    const testRenderer = TestRenderer.create(
      <RichTextElement
        richTextElement={complexItemResponse.item.elements["bio"] as Elements.RichTextElement}
        resolveDomNode={(domNode, domToReact) => {
          if (domNode instanceof DomHandlerElement && domNode.name === 'table') {
            return <div className="table-wrapper">{domToReact([domNode])}</div>;
          }
        }}
      />,
    );
    expect(testRenderer.toJSON()).toMatchSnapshot();
  });
});

