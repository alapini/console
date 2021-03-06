import * as React from 'react'
import * as Immutable from 'immutable'
import { createRefetchContainer, graphql } from 'react-relay'
import { withRouter, Link } from 'found'
import { connect } from 'react-redux'
import cuid from 'cuid'
import mapProps from '../../components/MapProps/MapProps'
import Tether from '../../components/Tether/Tether'
import { sideNavSyncer } from '../../utils/sideNavSyncer'
import { nextStep, showDonePopup } from '../../actions/gettingStarted'
import { showPopup } from '../../actions/popup'
import { Project, Viewer, Model } from '../../types/types'
import { ShowNotificationCallback } from '../../types/utils'
import { showNotification } from '../../actions/notification'
import { Popup } from '../../types/popup'
import { GettingStartedState } from '../../types/gettingStarted'
import EndpointPopup from './EndpointPopup'
import styled from 'styled-components'
import * as cx from 'classnames'
import { $p, $v, Icon } from 'graphcool-styles'
import { ExcludeProps } from '../../utils/components'
import tracker from '../../utils/metrics'
import { ConsoleEvents } from 'graphcool-metrics'
import SideNavElement from './SideNavElement'
import { RelayProp } from 'react-relay'
import { dummy } from '../../utils/dummy'

interface Props {
  params: any
  location: any
  project: Project
  projectCount: number
  viewer: Viewer
  relay: RelayProp
  models: Model[]
  gettingStartedState: GettingStartedState
  nextStep: () => Promise<any>
  skip: () => Promise<any>
  showNotification: ShowNotificationCallback
  router: InjectedFoundRouter
  showDonePopup: () => void
  showPopup: (popup: Popup) => void
  itemCount: number
  countChanges: Immutable.Map<string, number>
  isBetaCustomer: boolean
  expanded: boolean
}

interface State {
  forceShowModels: boolean
  addingNewModel: boolean
  newModelName: string
  newModelIsValid: boolean
  modelsExpanded: boolean
}

// Section (Models, Relations, Permissions, etc.)

// Section Heads

const footerSectionStyle = `
  display: flex;
  align-items: center;
  padding: ${$v.size25};
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 1px;
  color: ${$v.white60};
  cursor: pointer;
  transition: color ${$v.duration} linear;

  > div {
    margin-left: ${$v.size10};
  }

  svg {
    fill: ${$v.white60};
    transition: fill ${$v.duration} linear

  }

  &:hover {
    color: ${$v.white80};
    svg {
      fill: ${$v.white80};
    }
  }
`
const FooterSection = styled.div`${footerSectionStyle};`
const FooterLink = styled.a`${footerSectionStyle};`

export class SideNav extends React.Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      forceShowModels: false,
      addingNewModel: false,
      newModelName: '',
      newModelIsValid: true,
      modelsExpanded: false,
    }
  }

  componentDidMount() {
    sideNavSyncer.setCallback(this.fetch, this)
  }

  componentWillUnmount() {
    sideNavSyncer.setCallback(null, null)
  }

  render() {
    const { project, expanded } = this.props
    return (
      <div
        className="side-nav"
        onMouseLeave={() => this.setState({ forceShowModels: false } as State)}
      >
        <style jsx>{`
          .side-nav {
            @p: .relative, .h100, .white, .bgDarkerBlue, .f14, .flex,
              .flexColumn, .overflowHidden;
          }
          .scrollable {
            @p: .flex1, .h100, .flexColumn, .justifyBetween, .pt16,
              .overflowAuto, .nosb;
          }
          .scrollable.thin {
            @p: .overflowXHidden;
          }
          .footer {
            @p: .w100, .flexFixed, .bgDarkBlue, .flex, .itemsCenter,
              .justifyBetween, .white60;
            height: 70px;
          }
          .f {
            @p: .ttl, .f20, .tc;
            font-family: fantasy;
            line-height: 1;
            width: 24px;
          }
        `}</style>
        <div
          className={cx('scrollable', $p.h100, { thin: !expanded })}
          style={{ paddingBottom: '70px' }}
        >
          <SideNavElement
            link={`/${project.name}/schema`}
            iconSrc={require('assets/icons/schema.svg')}
            text="Schema"
            size={18}
            active={
              this.props.location.pathname.includes(`/schema`) &&
              this.props.params.projectName
            }
            small={!this.props.expanded}
          />
          <SideNavElement
            active={this.props.location.pathname.endsWith('databrowser')}
            link={`/${this.props.params.projectName}/models/${this.props
              .models[0].name}/databrowser`}
            iconSrc={require('assets/icons/databrowser.svg')}
            text="Data"
            size={16}
            minimalHighlight
            small={!this.props.expanded}
            data-test="sidenav-databrowser"
          />
          {location.pathname.endsWith('databrowser') && this.renderModels()}
          <SideNavElement
            link={`/${project.name}/permissions`}
            iconSrc={require('graphcool-styles/icons/fill/permissions.svg')}
            text="Permissions"
            active={this.props.location.pathname.includes('/permissions')}
            small={!this.props.expanded}
            data-test="sidenav-permissions"
          />
          <SideNavElement
            link={`/${project.name}/integrations`}
            iconSrc={require('graphcool-styles/icons/fill/integrations.svg')}
            text="Integrations"
            active={this.props.location.pathname.endsWith('/integrations')}
            small={!this.props.expanded}
          />
          <SideNavElement
            link={`/${project.name}/functions`}
            iconSrc={require('graphcool-styles/icons/fill/actions.svg')}
            text="Functions"
            active={this.props.location.pathname.includes('/functions')}
            small={!this.props.expanded}
            data-test="sidenav-functions"
          />
        </div>
        {this.renderPlayground()}
        <div className="footer">
          <FooterSection onClick={this.showEndpointPopup}>
            <Icon
              width={20}
              height={20}
              src={require('graphcool-styles/icons/fill/endpoints.svg')}
            />
            {this.props.expanded && <div>Endpoints</div>}
          </FooterSection>
          <FooterLink
            href="https://www.graph.cool/docs/"
            target="_blank"
            onClick={() => {
              tracker.track(ConsoleEvents.Sidenav.docsOpened())
            }}
          >
            <Icon
              width={20}
              height={20}
              src={require('graphcool-styles/icons/fill/docs.svg')}
            />
            {this.props.expanded && <div>Docs</div>}
          </FooterLink>
        </div>
      </div>
    )
  }

  private renderPlayground = () => {
    const showGettingStartedOnboardingPopup = () => {
      if (
        this.props.gettingStartedState.isCurrentStep('STEP3_OPEN_PLAYGROUND')
      ) {
        this.props.nextStep()
      }
    }

    return (
      <div className={cx('playground', { small: !this.props.expanded })}>
        <style jsx>{`
          .playground {
            @p: .mt16;
          }
          .playground-button {
            @p: .br2, .darkBlue, .f14, .fw6, .inlineFlex, .ttu, .ml25, .mb25,
              .itemsCenter;
            letter-spacing: 0.53px;
            background-color: rgb(185, 191, 196);
            padding: 7px 10px 8px 10px;
            transition: $duration all;
          }
          .playground-button:hover {
            @p: .bgWhite90;
          }
          .playground.small .playground-button {
            @p: .bgDarkerBlue, .pl0;
          }
          .text {
            @p: .ml10;
          }
          .playground.small .text {
            transform: translateX(20px);
          }
          .playground.small :global(svg) {
            fill: rgb(185, 191, 196) !important;
          }
        `}</style>
        <Link
          to={`/${this.props.params.projectName}/playground`}
          onClick={showGettingStartedOnboardingPopup}
        >
          <div className="playground-button">
            <Icon
              width={20}
              height={20}
              src={require('graphcool-styles/icons/fill/playground.svg')}
              color={$v.darkBlue}
            />
            <Tether
              side="top"
              steps={[
                {
                  step: 'STEP3_OPEN_PLAYGROUND',
                  title: 'Open the Playground',
                  description:
                    "Now that we have defined our Post type it's time to use the GraphQL API!", // tslint:disable-line
                },
              ]}
              offsetY={-20}
              width={280}
            >
              <div className="text">Playground</div>
            </Tether>
          </div>
        </Link>
      </div>
    )
  }

  private renderModels = () => {
    const modelActive = model =>
      this.props.location.pathname ===
        `/${this.props.params.projectName}/models/${model.name}/schema` ||
      this.props.location.pathname ===
        `/${this.props.params.projectName}/models/${model.name}/databrowser` ||
      this.props.location.pathname ===
        `/${encodeURIComponent(
          this.props.params.projectName,
        )}/models/${model.name}/schema` ||
      this.props.location.pathname ===
        `/${encodeURIComponent(
          this.props.params.projectName,
        )}/models/${model.name}/databrowser`

    const activeListElement = `
      color: ${$v.white} !important;
      background: ${$v.white07};
      cursor: default;
      &:before {
        content: "";
        position: absolute;
        top: -1px;
        bottom: -1px;
        left: 0;
        width: ${$v.size06};
        background: ${$v.green};
        border-radius: 0 2px 2px 0;
      }
      &:hover {
        color: inherit;
      }
    `

    const ListElement = styled(ExcludeProps(Link, ['active']))`
      transition: color ${$v.duration} linear;
      height: 32px;

      &:hover {
         color: ${$v.white60};
      }

      ${props => props.active && activeListElement}
    `

    return (
      <div className={cx($p.relative)}>
        <div
          className={cx($p.overflowHidden)}
          style={{
            height: 'auto',
            transition: 'height .5s ease',
          }}
        >
          <div className={cx($p.flex, $p.flexColumn, $p.mt10, $p.mb16)}>
            {this.props.models &&
              this.props.models.map(model =>
                <ListElement
                  key={model.name}
                  to={`/${this.props.params
                    .projectName}/models/${model.name}/databrowser`}
                  active={modelActive(model)}
                  className={cx(
                    $p.relative,
                    $p.fw6,
                    $p.white30,
                    $p.ph25,
                    $p.flex,
                    $p.justifyBetween,
                    $p.itemsCenter,
                    $p.mb6,
                    {
                      [$p.bgWhite07]: modelActive(model),
                    },
                  )}
                  data-test={`sidenav-databrowser-model-${model.name}`}
                >
                  <div
                    className={cx(
                      $p.pl6,
                      $p.mra,
                      $p.flex,
                      $p.flexRow,
                      $p.itemsCenter,
                    )}
                  >
                    <div title={model.name}>
                      {this.props.expanded
                        ? model.name
                        : model.name.slice(0, 2).toUpperCase()}
                    </div>
                    {this.props.expanded &&
                      (model.isSystem &&
                        <div
                          className={cx(
                            $p.ph4,
                            $p.br2,
                            $p.bgWhite20,
                            $p.darkerBlue,
                            $p.ttu,
                            $p.f12,
                            $p.ml10,
                          )}
                        >
                          System
                        </div>)}
                  </div>
                  {this.props.expanded &&
                    <div>
                      {model.itemCount +
                        (this.props.countChanges.get(model.id) || 0)}
                    </div>}
                </ListElement>,
              )}
          </div>
        </div>
      </div>
    )
  }

  private fetch = () => {
    // the backend might cache the force fetch requests, resulting in potentially inconsistent responses
    const { projectName } = this.props.params
    this.props.relay.refetch({
      projectName,
    })
  }

  private showEndpointPopup = () => {
    const id = cuid()
    this.props.showPopup({
      element: (
        <EndpointPopup
          id={id}
          projectId={this.props.project.id}
          alias={this.props.project.alias}
          region={this.props.project.region}
        />
      ),
      id,
    })
  }
}

const ReduxContainer = connect(
  state => ({
    gettingStartedState: state.gettingStarted.gettingStartedState,
    itemCount: state.databrowser.data.itemCount,
    countChanges: state.databrowser.data.countChanges,
  }),
  {
    nextStep,
    showDonePopup,
    showNotification,
    showPopup,
  },
)(withRouter(SideNav))

const MappedSideNav = mapProps({
  params: props => props.params,
  project: props => props.project,
  relay: props => props.relay,
  models: props =>
    props.project.models.edges
      .map(edge => edge.node)
      .sort((a, b) => a.name.localeCompare(b.name)),
  isBetaCustomer: props =>
    (props.viewer &&
      props.viewer.user &&
      props.viewer.user.crm &&
      props.viewer.user.crm.information &&
      props.viewer.user.crm.information.isBeta) ||
    false,
})(ReduxContainer)

export default createRefetchContainer(
  MappedSideNav,
  {
    viewer: graphql`
      fragment SideNav_viewer on Viewer {
        user {
          id
          createdAt
          crm {
            information {
              isBeta
            }
          }
        }
      }
    `,
    project: graphql.experimental`
      fragment SideNav_project on Project {
        id
        name
        alias
        webhookUrl
        region
        models(first: 1000) {
          edges {
            node {
              id
              name
              itemCount
              isSystem
            }
          }
        }
      }
    `,
  },
  graphql.experimental`
    query SideNavRefetchQuery($projectName: String!) {
      viewer {
        projectByName(projectName: $projectName) {
          ...SideNav_project
        }
      }
    }
  `,
)

const mutationFragments = graphql`
  fragment SideNav_model on Model {
    id
    name
    itemCount
    isSystem
  }
`

dummy(mutationFragments)
