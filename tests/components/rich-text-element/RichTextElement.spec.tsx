import React from 'react';
import { render } from '@testing-library/react';
import TestRenderer from 'react-test-renderer';
import { createDeliveryClient, Elements } from '@kentico/kontent-delivery';
import richTextItem from './richTextItem.json';
import { Element as ParserElement } from "html-react-parser";
import { RichTextElement } from '../../../src';
test('Parse rich text', () => {

  var mockClient = createDeliveryClient({
    projectId: 'dummyClient',
  });

  const response = mockClient.item("dummyItem")
    .map(richTextItem);


  const { debug } = render(<RichTextElement
    richTextElement={response.item.elements["bio"] as Elements.RichTextElement}
    linkedItems={response.linkedItems}
    resolveLinkedItem={undefined}
    resolveImage={undefined}
    resolveLink={undefined}
    resolveDomNode={undefined}
    className="testClassName"
  />);

  debug();
});

describe('<ReactRichTextElement/>', () => {
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
              return <b>{domToReact([domNode])}</b>;
            }
          }
        }
        }
      />,
    );
    expect(testRenderer.toJSON()).toMatchSnapshot();
  });

  // it('Complex rich-text value - render properly no resolution', () => {
  //   const testRenderer = TestRenderer.create(
  //     <ReactRichTextElement richTextElement={sampleComplexValue} />,
  //   );
  //   expect(testRenderer.toJSON()).toMatchSnapshot();
  // });

  // it('Resolve images', () => {
  //   const testRenderer = TestRenderer.create(
  //     <ReactRichTextElement
  //       richTextElement={sampleComplexValue}
  //       images={images}
  //       resolveImage={(image): JSX.Element => (
  //         <img
  //           src={image.url}
  //           alt={image.description ? image.description : image.name}
  //           width="200"
  //         />
  //       )}
  //     />,
  //   );
  //   expect(testRenderer.toJSON()).toMatchSnapshot();
  // });

  // it('Resolve links', () => {
  //   const complexValueRenderer = TestRenderer.create(
  //     <ReactRichTextElement
  //       richTextElement={sampleComplexValue}
  //       links={links}
  //       resolveLink={(link, domNode): JSX.Element => {
  //         return (
  //           // normally a Link component from gatsby package would be used
  //           <a href={`/${link.type}/${link.url_slug}`}>
  //             {domNode.children[0].data}
  //           </a>
  //         );
  //       }}
  //     />,
  //   );
  //   expect(complexValueRenderer.toJSON()).toMatchSnapshot();


  //   const simpleValueRenderer = TestRenderer.create(
  //     <ReactRichTextElement
  //       richTextElement={'<p>This is the page text.</p><ul><li><a data-item-id="1abb6bf1-1e29-4deb-bb0c-b5928ffb0cc9" href="">Test link</a></li></ul>'}
  //       links={[
  //         {
  //           "url_slug": "test-nico",
  //           "type": "page",
  //           "link_id": "1abb6bf1-1e29-4deb-bb0c-b5928ffb0cc9",
  //           "codename": "test_page_nico"
  //         }
  //       ]}
  //       resolveLink={(link, domNode): JSX.Element => {
  //         return (
  //           // normally a Link component from gatsby package would be used
  //           <a href={`/${link.type}/${link.url_slug}`}>
  //             {domNode.children[0].data}
  //           </a>
  //         );
  //       }}
  //     />,
  //   );
  //   expect(simpleValueRenderer.toJSON()).toMatchSnapshot();
  // });

  // it('Resolve linked items', () => {
  //   const testRenderer = TestRenderer.create(
  //     <ReactRichTextElement
  //       richTextElement={sampleComplexValue}
  //       linkedItems={linkedItems}
  //       resolveLinkedItem={(linkedItem): JSX.Element => {
  //         return <pre>{JSON.stringify(linkedItem, undefined, 2)}</pre>;
  //       }}
  //     />,
  //   );
  //   expect(testRenderer.toJSON()).toMatchSnapshot();
  // });

  // it('Resolve geneal node - wrap table element', () => {
  //   const testRenderer = TestRenderer.create(
  //     <ReactRichTextElement
  //       richTextElement={sampleComplexValue}
  //       resolveDomNode={(domNode, domToReact): JSX.Element => {
  //         if (domNode.name === 'table') {
  //           return <div className="table-wrapper">{domToReact([domNode])}</div>;
  //         }
  //       }}
  //     />,
  //   );
  //   expect(testRenderer.toJSON()).toMatchSnapshot();
  // });
});

