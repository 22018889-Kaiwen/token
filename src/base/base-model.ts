import { Column, CreatedAt, DeletedAt, Model, UpdatedAt } from "sequelize-typescript";

export class BaseModel extends Model {
    // @Column({
    //   type: DataType.UUID,
    //   defaultValue: DataType.UUIDV4,
    //   primaryKey: true,
    // })
    // id: string;
  
    @CreatedAt
    @Column({
      field: "created_at",
    })
    createdAt: Date;
  
    @UpdatedAt
    @Column({
      field: "updated_at",
    })
    updatedAt: Date;
  
    @DeletedAt
    @Column({
      field: "deleted_at",
    })
    deletedAt: Date;
  }
  