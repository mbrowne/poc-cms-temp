import React from 'react'
import Select from 'react-select'
import { FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'
import { isEmpty } from 'lodash'

// CSS.
import 'react-select/dist/react-select.css'
// Component.
import SortableList from './SortableList'
// CSS.
import styles from './styles.scss'

import * as queries from '../../graphql/queries'

class SelectMany extends React.PureComponent {
    state = {
        isLoading: true,
        options: [],
        toSkip: 0,
    }

    componentDidMount() {
        this.getOptions()
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.toSkip !== this.state.toSkip) {
            this.getOptions()
        }
    }

    async getOptions() {
        const { associationDef, apolloClient } = this.props
        const { data, errors } = await apolloClient.query({
            query: queries.associationSelectOptions,
            variables: {
                where: {
                    entityDefId: associationDef.destinationItemDef.entityDef.id,
                },
            },
        })
        if (errors) {
            console.error('Apollo error(s): ', JSON.stringify(errors))
            strapi.notification.error(
                'content-manager.notification.error.relationship.fetch'
            )
            return
        }

        const options = data.entities.results.map(entity => ({
            value: entity,
            label: entity.displayName,
        }))

        // Remove any options from the list that are already associated
        const values = (
            this.props.entityState[this.props.associationDef.id] || []
        ).map(el => el.id)
        const newOptions = options.filter(el => {
            return !values.includes(el.value.id)
        })

        this.setState({
            options: newOptions,
            isLoading: false,
        })
    }

    handleInputChange = value => {
        const clonedOptions = this.state.options
        const filteredValues = clonedOptions.filter(data =>
            data.label.includes(value)
        )

        if (filteredValues.length === 0) {
            return this.getOptions(value)
        }
    }

    handleChange = value => {
        // Remove new added value from available option;
        this.state.options = this.state.options.filter(
            el => el.value.id !== value.value.id
        )

        this.props.onAddAssociationItem({
            propertyId: this.props.associationDef.id,
            item: value.value,
        })
    }

    handleBottomScroll = () => {
        this.setState(prevState => {
            return {
                toSkip: prevState.toSkip + 20,
            }
        })
    }

    handleRemove = index => {
        const {
            entityState,
            associationDef,
            onRemoveAssociationItem,
        } = this.props
        const associatedEntities = entityState[associationDef.id]
        const selectedEntity = associatedEntities[index]

        // Add removed value to available options
        const toAdd = {
            value: selectedEntity,
            label: selectedEntity.displayName,
        }

        this.setState(prevState => ({
            options: prevState.options.concat([toAdd]),
        }))

        onRemoveAssociationItem({
            propertyId: associationDef.id,
            index,
        })
    }

    // handleRemove = index => {
    //     const values = get(this.props.record, this.props.relation.alias)

    //     // Add removed value to available options
    //     const toAdd = {
    //         value: values[index],
    //         label: templateObject(
    //             { mainField: this.props.relation.displayedAttribute },
    //             values[index]
    //         ).mainField,
    //     }

    //     this.setState(prevState => ({
    //         options: prevState.options.concat([toAdd]),
    //     }))

    //     this.props.onRemoveRelationItem({
    //         key: this.props.relation.alias,
    //         index,
    //     })
    // }

    // Redirect to the edit page
    handleClickDetails = associatedEntity => {
        this.props.onClickEntityDetails({
            associationDef: this.props.associationDef,
            associatedEntity,
        })
    }

    render() {
        const { state } = this
        const {
            associationDef,
            entityState,
            isDraggingSibling,
            moveAttr,
            moveAttrEnd,
        } = this.props
        const description = associationDef.description ? (
            <p>{associationDef.description}</p>
        ) : (
            ''
        )
        const propertyId = associationDef.id
        const associatedEntities = entityState[propertyId]

        /* eslint-disable jsx-a11y/label-has-for */
        return (
            <div
                className={`form-group ${
                    styles.selectMany
                } ${associatedEntities.length > 4 && styles.selectManyUpdate}`}
            >
                <label htmlFor={associationDef.id}>
                    {associationDef.label}{' '}
                    <span>({associatedEntities.length})</span>
                </label>
                {description}
                <Select
                    className={`${styles.select}`}
                    id={associationDef.id}
                    isLoading={state.isLoading}
                    onChange={this.handleChange}
                    onInputChange={this.handleInputChange}
                    onMenuScrollToBottom={this.handleBottomScroll}
                    options={state.options}
                    placeholder={
                        <FormattedMessage id="content-manager.containers.Edit.addAnItem" />
                    }
                />
                <SortableList
                    items={associatedEntities.map(entity => ({
                        value: entity,
                        label: entity.displayName,
                    }))}
                    isDraggingSibling={isDraggingSibling}
                    keys={associationDef.label}
                    moveAttr={moveAttr}
                    moveAttrEnd={moveAttrEnd}
                    name={associationDef.id}
                    onRemove={this.handleRemove}
                    distance={1}
                    onClick={this.handleClickDetails}
                />
            </div>
        )
        /* eslint-disable jsx-a11y/label-has-for */
    }
}

SelectMany.defaultProps = {
    isDraggingSibling: false,
    moveAttr: () => {},
    moveAttrEnd: () => {},
}

SelectMany.propTypes = {
    apolloClient: PropTypes.object.isRequired,
    associationDef: PropTypes.object.isRequired,
    entityState: PropTypes.object.isRequired,
    onAddAssociationItem: PropTypes.func.isRequired,
    onRemoveAssociationItem: PropTypes.func.isRequired,
    onClickEntityDetails: PropTypes.func.isRequired,
}

export default SelectMany
