/**
 *
 * AttributeRow
 *
 */

import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { capitalize, get, has } from 'lodash'

import PopUpWarning from 'components/PopUpWarning'
import IcoContainer from 'components/IcoContainer'

import IcoBoolean from '../../assets/images/icon_boolean.png'
import IcoDate from '../../assets/images/icon_date.png'
import IcoEmail from '../../assets/images/icon_email.png'
import IcoImage from '../../assets/images/icon_image.png'
import IcoNumber from '../../assets/images/icon_number.png'
import IcoJson from '../../assets/images/icon_json.png'
import IcoPassword from '../../assets/images/icon_password.png'
import IcoRelation from '../../assets/images/icon_relation.png'
import IcoString from '../../assets/images/icon_string.png'
import IcoText from '../../assets/images/icon_text.png'
import IcoEnum from '../../assets/images/icon_enum.png'
import styles from './styles.scss'

/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/jsx-curly-brace-presence */
class AttributeRow extends React.Component {
    // eslint-disable-line react/prefer-stateless-function
    constructor(props) {
        super(props)
        this.asset = {
            boolean: IcoBoolean,
            date: IcoDate,
            media: IcoImage,
            number: IcoNumber,
            json: IcoJson,
            relation: IcoRelation,
            string: IcoString,
            text: IcoText,
            integer: IcoNumber,
            float: IcoNumber,
            decimal: IcoNumber,
            email: IcoEmail,
            password: IcoPassword,
            enumeration: IcoEnum,
        }
        this.state = {
            showWarning: false,
        }
    }

    handleEdit = () => this.props.onEditAttribute(this.props.row.id)

    handleDelete = () => {
        this.props.onDelete(this.props.row.id)
        this.setState({ showWarning: false })
    }

    handleShowModalWarning = () =>
        this.setState({ showWarning: !this.state.showWarning })

    toggleModalWarning = () =>
        this.setState({ showWarning: !this.state.showWarning })

    renderAttributesBox = () => {
        const attributeType = this.props.row.dataType || 'relation'
        const src = this.asset[attributeType]
        return <img src={src} alt="ico" />
    }

    render() {
        const prop = this.props.row
        // TEMP
        const params = {}
        const type =
            prop.dataType === 'text' &&
            get(params, 'appearance.WYSIWYG') === true
                ? 'WYSIWYG'
                : prop.dataType
        const relationType = prop.dataType ? (
            <FormattedMessage id={`content-type-builder.attribute.${type}`} />
        ) : null
        // <div>
        //     <FormattedMessage id="content-type-builder.modelPage.attribute.relationWith" />
        //     &nbsp;
        //     <FormattedMessage id="content-type-builder.from">
        //         {message => (
        //             <span style={{ fontStyle: 'italic' }}>
        //                 {capitalize(params.target)}&nbsp;
        //                 {params.pluginValue
        //                     ? `(${message}: ${params.pluginValue})`
        //                     : ''}
        //             </span>
        //         )}
        //     </FormattedMessage>
        // </div>
        const relationStyle = !params.type ? styles.relation : ''
        const isNotEditable =
            prop.id === 'businessId' || prop.readOnly || prop.inheritedFrom
        const icons = isNotEditable
            ? [{ icoType: 'lock' }]
            : [
                  { icoType: 'pencil', onClick: this.handleEdit },
                  {
                      icoType: 'trash',
                      onClick: () =>
                          this.setState({
                              showWarning: !this.state.showWarning,
                          }),
                  },
              ]
        const editableStyle = prop.readOnly ? '' : styles.editable

        return (
            <li
                className={`${
                    styles.attributeRow
                } ${editableStyle} ${relationStyle}`}
                onClick={() => {
                    isNotEditable ? () => {} : this.handleEdit()
                }}
            >
                <div className={styles.flex}>
                    <div className={styles.nameContainer}>
                        {this.renderAttributesBox()}
                        <div>{prop.label}</div>
                    </div>
                    <div className={styles.relationContainer}>
                        {relationType}
                    </div>
                    <div className={styles.inheritedFrom}>
                        {prop.inheritedFrom ? prop.inheritedFrom.label : '-'}
                    </div>
                    <IcoContainer icons={icons} />
                </div>
                <PopUpWarning
                    isOpen={this.state.showWarning}
                    toggleModal={this.toggleModalWarning}
                    content={{
                        message:
                            'content-type-builder.popUpWarning.bodyMessage.attribute.delete',
                    }}
                    popUpWarningType={'danger'}
                    onConfirm={this.handleDelete}
                />
            </li>
        )
    }
}

AttributeRow.propTypes = {
    onDelete: PropTypes.func.isRequired,
    onEditAttribute: PropTypes.func.isRequired,
    row: PropTypes.object.isRequired,
}

export default AttributeRow
