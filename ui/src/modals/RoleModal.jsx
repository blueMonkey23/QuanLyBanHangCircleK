import { StatusPill } from '../components/common'

function RoleModal({ show, roles, permissionNamesCatalog, onClose }) {
  if (!show) {
    return null
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal-card modal-card--wide">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Add Roles</p>
            <h3>Preview popup phân quyền</h3>
          </div>
          <button className="ghost-button" type="button" onClick={onClose}>
            X
          </button>
        </div>

        <div className="section-grid section-grid--roles">
          <div className="stack-list">
            {roles.map((role) => (
              <div key={role.id} className="stack-list__item">
                <div>
                  <strong>{role.name}</strong>
                  <p>{role.description}</p>
                </div>
                <StatusPill tone="info">Role #{role.id}</StatusPill>
              </div>
            ))}
          </div>

          <div className="permission-cloud">
            {permissionNamesCatalog.map((permission) => (
              <span key={permission} className="permission-chip">
                {permission}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoleModal
