/**
 *
 * SelectOne
 *
 */

import React from 'react'
import Select from 'react-select'
import { FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'
import 'react-select/dist/react-select.css'
import invariant from 'invariant'

import styles from './styles.scss'
import * as queries from '../../graphql/queries'

// import templateObject from 'utils/templateObject'

class SelectOne extends React.Component {
    // eslint-disable-line react/prefer-stateless-function
    constructor(props) {
        super(props)

        this.state = {
            isLoading: true,
            options: [],
            toSkip: 0,
        }
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
            value: entity.id,
            label: entity.displayName,
            entity: entity,
        }))

        this.setState({
            options,
            isLoading: false,
        })
    }

    handleChange = destinationEntityId => {
        const destinationEntity = destinationEntityId
            ? this.state.options.find(opt => opt.value === destinationEntityId)
                  .entity
            : null
        const args = {
            propertyId: `${this.props.associationDef.id}`,
            destinationEntity,
        }
        this.props.onChangeData(args)
    }

    handleBottomScroll = () => {
        this.setState(prevState => {
            return {
                toSkip: prevState.toSkip + 20,
            }
        })
    }

    // Redirect to the edit page
    handleClickDetails = associatedEntity => {
        this.props.onClickEntityDetails({
            associationDef: this.props.associationDef,
            associatedEntity,
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

    render() {
        const { associationDef, entityState } = this.props
        const description = associationDef.description ? (
            <p>{associationDef.description}</p>
        ) : (
            ''
        )
        const propertyId = associationDef.id
        const associatedEntities = entityState[propertyId]
        // Temporary.
        const entryLink =
            associatedEntities.length === 0 ? (
                ''
            ) : (
                <FormattedMessage id="content-manager.containers.Edit.clickToJump">
                    {title => (
                        <a
                            onClick={() =>
                                this.handleClickDetails(associatedEntities[0])
                            }
                            title={title}
                        >
                            <FormattedMessage id="content-manager.containers.Edit.seeDetails" />
                        </a>
                    )}
                </FormattedMessage>
            )

        invariant(
            associatedEntities.length <= 1,
            'SelectOne component should only be used for to-one associations (not to-many)'
        )
        const selectedEntitiesAsString = associatedEntities[0]
            ? associatedEntities[0].displayName
            : ''

        /* eslint-disable jsx-a11y/label-has-for */
        return (
            <div className={`form-group ${styles.selectOne}`}>
                <nav className={styles.headline}>
                    <label htmlFor={propertyId}>{associationDef.label}</label>
                    {entryLink}
                </nav>
                {description}
                <Select
                    onChange={this.handleChange}
                    options={this.state.options}
                    id={propertyId}
                    isLoading={this.state.isLoading}
                    onMenuScrollToBottom={this.handleBottomScroll}
                    onInputChange={this.handleInputChange}
                    onSelectResetsInput={false}
                    simpleValue
                    value={
                        associatedEntities.length === 0
                            ? null
                            : {
                                  value: associatedEntities,
                                  label: selectedEntitiesAsString,
                              }
                    }
                    // value={
                    //     isNull(value) || isUndefined(value)
                    //         ? null
                    //         : {
                    //               value,
                    //               label:
                    //                   templateObject(
                    //                       {
                    //                           mainField:
                    //                               associationDef.displayedAttribute,
                    //                       },
                    //                       isFunction(value.toJS)
                    //                           ? value.toJS()
                    //                           : value
                    //                   ).mainField ||
                    //                   (isFunction(value.toJS)
                    //                       ? get(value.toJS(), 'id')
                    //                       : get(value, 'id')),
                    //           }
                    // }
                />
            </div>
        )
        /* eslint-disable jsx-a11y/label-has-for */
    }
}

SelectOne.propTypes = {
    apolloClient: PropTypes.object.isRequired,
    onClickEntityDetails: PropTypes.func.isRequired,
    associationDef: PropTypes.object.isRequired,
    entityState: PropTypes.object.isRequired,
    onChangeData: PropTypes.func.isRequired,
    // onRedirect: PropTypes.func.isRequired,
}

export default SelectOne
